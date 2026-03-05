package com.clab.clabbackend.auth;

import com.clab.clabbackend.dto.AuthResponseDTO;
import com.clab.clabbackend.dto.LoginRequestDTO;
import com.clab.clabbackend.entities.Usuario;
import com.clab.clabbackend.entities.UsuarioRol;
import com.clab.clabbackend.repository.RolPermisoRepository;
import com.clab.clabbackend.repository.RolRepository;
import com.clab.clabbackend.repository.UsuarioRepository;
import com.clab.clabbackend.repository.UsuarioRolRepository;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.AuditoriaService;
import com.clab.clabbackend.services.EmailService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Random;

@Service
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioRolRepository usuarioRolRepository;
    private final EmailService emailService;
    private final RolRepository rolRepository;
    private final RolPermisoRepository rolPermisoRepository;
    private final AuditoriaService auditoriaService;

    public AuthService(PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       UsuarioRepository usuarioRepository,
                       UsuarioRolRepository usuarioRolRepository,
                       EmailService emailService,
                       RolRepository rolRepository,
                       RolPermisoRepository rolPermisoRepository,
                       AuditoriaService auditoriaService) {
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.usuarioRolRepository = usuarioRolRepository;
        this.emailService = emailService;
        this.rolRepository = rolRepository;
        this.rolPermisoRepository = rolPermisoRepository;
        this.auditoriaService = auditoriaService;
    }

    private List<String> obtenerPermisosDeRol(String nombreRol) {
        return rolRepository.findByNombreRolIgnoreCase(nombreRol).map(rol -> rolPermisoRepository
                        .findByRol_IdRolAndVigenteTrue(rol.getIdRol())
                        .stream()
                        .map(rp -> rp.getPermiso().getNombrePermiso())
                        .toList())
                .orElse(List.of());
    }

    // ─── LOGIN ───────────────────────────────────────────────────────────────
    public AuthResponseDTO login(LoginRequestDTO request, String ip) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsuario(), request.getContrasenia())
            );
        } catch (Exception e) {
            auditoriaService.registrarFallo(null, request.getUsuario(),
                    "LOGIN", "AUTH", "Intento de login fallido: credenciales incorrectas", ip);
            throw e;
        }

        Usuario usuario = usuarioRepository
                .findByUsuarioAndEstado(request.getUsuario(), "ACTIVO")
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado o inactivo"));

        List<UsuarioRol> rolesVigentes = usuarioRolRepository
                .findAllByUsuario_IdUsuarioAndVigenteTrue(usuario.getIdUsuario())
                .stream()
                .sorted(Comparator.comparing(UsuarioRol::getFechaAsignacion))
                .toList();

        if (rolesVigentes.isEmpty()) throw new RuntimeException("El usuario no tiene rol asignado");

        String rolPrincipal = rolesVigentes.get(0).getRol().getNombreRol();
        List<String> rolesDisponibles = rolesVigentes.stream()
                .map(ur -> ur.getRol().getNombreRol()).toList();

        List<String> permisos = obtenerPermisosDeRol(rolPrincipal);
        String token = jwtService.generarToken(usuario.getIdUsuario(), rolPrincipal, permisos);

        // Registrar sesión via SP
        auditoriaService.registrarSesion(
                usuario.getIdUsuario(), usuario.getUsuario(),
                token, ip, LocalDateTime.now().plusHours(1)
        );

        // Auditoría via SP
        auditoriaService.registrarExito(
                usuario.getIdUsuario(), usuario.getUsuario(),
                "LOGIN", "AUTH", "u_usuario",
                usuario.getIdUsuario(), "Login exitoso con rol: " + rolPrincipal, ip
        );

        return new AuthResponseDTO(token, usuario.getNombres(), usuario.getApellidos(),
                rolPrincipal, usuario.getIdUsuario(), rolesDisponibles);
    }

    // ─── CAMBIAR ROL ─────────────────────────────────────────────────────────
    public AuthResponseDTO cambiarRol(Integer idUsuario, String nombreRol, String ip) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<UsuarioRol> rolesVigentes = usuarioRolRepository
                .findAllByUsuario_IdUsuarioAndVigenteTrue(idUsuario);

        rolesVigentes.stream()
                .filter(ur -> ur.getRol().getNombreRol().equals(nombreRol))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("El usuario no tiene el rol: " + nombreRol));

        List<String> rolesDisponibles = rolesVigentes.stream()
                .map(ur -> ur.getRol().getNombreRol()).toList();

        List<String> permisos = obtenerPermisosDeRol(nombreRol);
        String token = jwtService.generarToken(idUsuario, nombreRol, permisos);

        auditoriaService.registrarSesion(idUsuario, usuario.getUsuario(),
                token, ip, LocalDateTime.now().plusHours(1));

        auditoriaService.registrarExito(idUsuario, usuario.getUsuario(),
                "CAMBIO_ROL", "AUTH", "u_usuario_rol",
                idUsuario, "Cambió al rol: " + nombreRol, ip);

        return new AuthResponseDTO(token, usuario.getNombres(), usuario.getApellidos(),
                nombreRol, idUsuario, rolesDisponibles);
    }

    // ─── LOGOUT ──────────────────────────────────────────────────────────────
    public void logout(String token, Integer idUsuario, String ip) {
        // SP registra sesión inactiva y auditoría en un solo paso
        auditoriaService.cerrarSesion(token, idUsuario, ip);
    }

    // ─── RECUPERACIÓN DE CONTRASEÑA ──────────────────────────────────────────
    public void solicitarRecuperacion(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No existe ningún usuario con ese correo"));

        String codigo = String.format("%06d", new Random().nextInt(999999));
        usuario.setTokenRecuperacion(codigo);
        usuario.setExpiracionToken(LocalDateTime.now().plusMinutes(15));
        usuarioRepository.save(usuario);

        try {
            emailService.enviarCorreoRecuperacion(email, codigo);
        } catch (Exception e) {
            usuario.setTokenRecuperacion(null);
            usuario.setExpiracionToken(null);
            usuarioRepository.save(usuario);
            throw new RuntimeException("No se pudo enviar el correo: " + e.getMessage());
        }
    }

    public boolean verificarCodigo(String email, String codigo) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (usuario.getTokenRecuperacion() == null || !usuario.getTokenRecuperacion().equals(codigo))
            throw new RuntimeException("Código incorrecto");
        if (usuario.getExpiracionToken().isBefore(LocalDateTime.now()))
            throw new RuntimeException("El código ha expirado. Solicita uno nuevo.");
        return true;
    }

    public void resetPassword(String email, String codigo, String nuevaPassword) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (usuario.getTokenRecuperacion() == null || !usuario.getTokenRecuperacion().equals(codigo))
            throw new RuntimeException("Código inválido");
        if (usuario.getExpiracionToken().isBefore(LocalDateTime.now()))
            throw new RuntimeException("El código ha expirado. Solicita uno nuevo.");
        usuario.setContrasenia(passwordEncoder.encode(nuevaPassword));
        usuario.setTokenRecuperacion(null);
        usuario.setExpiracionToken(null);
        usuarioRepository.save(usuario);
    }
}