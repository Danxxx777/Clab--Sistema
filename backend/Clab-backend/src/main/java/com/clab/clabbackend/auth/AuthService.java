package com.clab.clabbackend.auth;

import com.clab.clabbackend.dto.AuthResponseDTO;
import com.clab.clabbackend.dto.LoginRequestDTO;
import com.clab.clabbackend.entities.Usuario;
import com.clab.clabbackend.repository.UsuarioRepository;
import com.clab.clabbackend.repository.UsuarioRolRepository;
import com.clab.clabbackend.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDateTime;
import java.util.Random;
import com.clab.clabbackend.services.EmailService;

@Service
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioRolRepository usuarioRolRepository;
    private final EmailService emailService;

    public AuthService(
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UsuarioRepository usuarioRepository,
            UsuarioRolRepository usuarioRolRepository,
            EmailService emailService
    ) {
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.usuarioRolRepository = usuarioRolRepository;
        this.emailService = emailService;
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsuario(), request.getContrasenia())
        );
        Usuario usuario = usuarioRepository
                .findByUsuarioAndEstado(request.getUsuario(), "ACTIVO")
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado o inactivo"));

        var usuarioRol = usuarioRolRepository
                .findByUsuario_IdUsuarioAndVigenteTrue(usuario.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("El usuario no tiene rol asignado"));

        String token = jwtService.generarToken(usuario.getIdUsuario(), usuarioRol.getRol().getNombreRol());
        return new AuthResponseDTO(token, usuario.getNombres(), usuario.getApellidos(), usuarioRol.getRol().getNombreRol());
    }

    public void solicitarRecuperacion(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No existe ningún usuario con ese correo"));

        // Generar código de 6 dígitos
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

        if (usuario.getTokenRecuperacion() == null ||
                !usuario.getTokenRecuperacion().equals(codigo)) {
            throw new RuntimeException("Código incorrecto");
        }

        if (usuario.getExpiracionToken().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El código ha expirado. Solicita uno nuevo.");
        }

        return true;
    }

    public void resetPassword(String email, String codigo, String nuevaPassword) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getTokenRecuperacion() == null ||
                !usuario.getTokenRecuperacion().equals(codigo)) {
            throw new RuntimeException("Código inválido");
        }

        if (usuario.getExpiracionToken().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El código ha expirado. Solicita uno nuevo.");
        }

        usuario.setContrasenia(passwordEncoder.encode(nuevaPassword));
        usuario.setTokenRecuperacion(null);
        usuario.setExpiracionToken(null);
        usuarioRepository.save(usuario);
    }
}