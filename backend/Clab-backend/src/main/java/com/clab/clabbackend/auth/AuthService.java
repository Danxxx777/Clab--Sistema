package com.clab.clabbackend.auth;

import com.clab.clabbackend.dto.AuthResponseDTO;
import com.clab.clabbackend.dto.LoginRequestDTO;
import com.clab.clabbackend.dto.ModuloDTO;
import com.clab.clabbackend.entities.Usuario;
import com.clab.clabbackend.entities.UsuarioRol;
import com.clab.clabbackend.repository.*;
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
    private final ModuloRolRepository moduloRolRepository;

    public AuthService(PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       UsuarioRepository usuarioRepository,
                       UsuarioRolRepository usuarioRolRepository,
                       EmailService emailService,
                       RolRepository rolRepository,
                       RolPermisoRepository rolPermisoRepository,
                       AuditoriaService auditoriaService,
                       ModuloRolRepository moduloRolRepository)
    {
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.usuarioRolRepository = usuarioRolRepository;
        this.emailService = emailService;
        this.rolRepository = rolRepository;
        this.rolPermisoRepository = rolPermisoRepository;
        this.auditoriaService = auditoriaService;
        this.moduloRolRepository = moduloRolRepository;
    }

    private List<String> obtenerPermisosDeRol(String nombreRol) {
        return rolRepository.findByNombreRolIgnoreCase(nombreRol).map(rol -> rolPermisoRepository
                        .findByRol_IdRolAndVigenteTrue(rol.getIdRol())
                        .stream()
                        .map(rp -> rp.getPermiso().getNombrePermiso())
                        .toList())
                .orElse(List.of());
    }

    private List<ModuloDTO> obtenerModulosDeRol(String nombreRol) {
        return rolRepository.findByNombreRolIgnoreCase(nombreRol)
                .map(rol -> moduloRolRepository.findByRol_IdRol(rol.getIdRol())
                        .stream()
                        .map(mr -> new ModuloDTO(
                                mr.getModulo().getNombre(),
                                mr.getModulo().getRuta(),
                                mr.getModulo().getIcono(),
                                mr.getModulo().getOrden(),
                                mr.getModulo().getDescripcion()
                        ))
                        .sorted(Comparator.comparing(ModuloDTO::orden))
                        .toList()
                )
                .orElse(List.of());
    }

    // ─── LOGIN ───────────────────────────────────────────────────────────────
    public AuthResponseDTO login(LoginRequestDTO request, String ip) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsuario(), request.getContrasenia())
            );
        } catch (Exception e) {
            try {
                auditoriaService.registrarFallo(null, request.getUsuario(),
                        "LOGIN", "AUTH", "Intento de login fallido: credenciales incorrectas", ip);
            } catch (Exception ignored) {}
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
        String token = jwtService.generarToken(usuario.getIdUsuario(), usuario.getUsuario(), rolPrincipal, permisos);

        try { auditoriaService.registrarSesion(usuario.getIdUsuario(), usuario.getUsuario(),
                token, ip, LocalDateTime.now().plusHours(1)); } catch (Exception ignored) {}

        try { auditoriaService.registrarExito(usuario.getIdUsuario(), usuario.getUsuario(),
                "LOGIN", "AUTH", "u_usuario", usuario.getIdUsuario(),
                "Login exitoso con rol: " + rolPrincipal, ip); } catch (Exception ignored) {}

        List<ModuloDTO> modulos = obtenerModulosDeRol(rolPrincipal);

        return new AuthResponseDTO(token, usuario.getNombres(), usuario.getApellidos(),
                rolPrincipal, usuario.getIdUsuario(), rolesDisponibles,
                usuario.isPrimerLogin(), modulos);
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

        List<String> rolesDisponibles = usuarioRolRepository
                .findAllByUsuario_IdUsuarioAndVigenteTrue(idUsuario)
                .stream()
                .filter(ur -> "ACTIVO".equals(ur.getRol().getEstado())) // ← agrega este filtro
                .map(ur -> ur.getRol().getNombreRol())
                .toList();

        List<String> permisos = obtenerPermisosDeRol(nombreRol);
        String token = jwtService.generarToken(idUsuario, usuario.getUsuario(), nombreRol, permisos);

        try {
            auditoriaService.registrarSesion(idUsuario, usuario.getUsuario(),
                    token, ip, LocalDateTime.now().plusHours(1));
        } catch (Exception e) {
            // BD vacía — se omite
        }
        auditoriaService.registrarExito(idUsuario, usuario.getUsuario(),
                "CAMBIO_ROL", "AUTH", "u_usuario_rol",
                idUsuario, "Cambió al rol: " + nombreRol, ip);

        List<ModuloDTO> modulos = obtenerModulosDeRol(nombreRol); // ← nuevo

        AuthResponseDTO response = new AuthResponseDTO(
                token, usuario.getNombres(), usuario.getApellidos(),
                nombreRol, idUsuario, rolesDisponibles,
                false, modulos  // ← modulos al final
        );
        return response;
    }

    // ─── LOGOUT ──────────────────────────────────────────────────────────────
    public void logout(String token, Integer idUsuario, String ip) {
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

    public List<ModuloDTO> obtenerModulosPublico(String nombreRol) {
        return obtenerModulosDeRol(nombreRol);
    }

    public List<String> obtenerRolesVigentes(Integer idUsuario) {
        return usuarioRolRepository
                .findAllByUsuario_IdUsuarioAndVigenteTrue(idUsuario)
                .stream()
                .filter(ur -> "ACTIVO".equals(ur.getRol().getEstado()))
                .map(ur -> ur.getRol().getNombreRol())
                .toList();
    }
}