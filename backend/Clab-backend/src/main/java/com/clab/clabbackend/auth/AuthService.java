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
import java.util.UUID;
import com.clab.clabbackend.services.EmailService;


@Service
public class AuthService {
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioRolRepository usuarioRolRepository;
    private final EmailService emailService;



    public AuthService(PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       UsuarioRepository usuarioRepository,
                       UsuarioRolRepository usuarioRolRepository, EmailService emailService) {
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.usuarioRolRepository = usuarioRolRepository;
        this.emailService = emailService;
    }

    public AuthResponseDTO login(LoginRequestDTO request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsuario(),
                        request.getContrasenia()
                )
        );

        Usuario usuario = usuarioRepository
                .findByUsuarioAndEstado(request.getUsuario(), "ACTIVO")
                .orElseThrow();

        var usuarioRol = usuarioRolRepository
                .findByUsuario_IdUsuarioAndVigenteTrue(usuario.getIdUsuario())
                .orElseThrow();

        String token = jwtService.generarToken(
                usuario.getIdUsuario(),
                usuarioRol.getRol().getNombreRol()
        );

        return new AuthResponseDTO(
                token,
                usuario.getNombres(),
                usuario.getApellidos(),
                usuarioRol.getRol().getNombreRol()
        );
    }
    public void solicitarRecuperacion(String email) {

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String token = UUID.randomUUID().toString();

        usuario.setTokenRecuperacion(token);
        usuario.setExpiracionToken(LocalDateTime.now().plusMinutes(15));

        usuarioRepository.save(usuario);

        // Enviar correo real
        emailService.enviarCorreoRecuperacion(email, token);
    }

    public void resetPassword(String token, String nuevaPassword) {

        Usuario usuario = usuarioRepository.findByTokenRecuperacion(token)
                .orElseThrow(() -> new RuntimeException("Token inválido"));

        if (usuario.getExpiracionToken() == null ||
                usuario.getExpiracionToken().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expirado");
        }

        usuario.setContrasenia(passwordEncoder.encode(nuevaPassword));
        usuario.setTokenRecuperacion(null);
        usuario.setExpiracionToken(null);

        usuarioRepository.save(usuario);
    }

}
