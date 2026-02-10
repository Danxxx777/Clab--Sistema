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

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioRolRepository usuarioRolRepository;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       UsuarioRepository usuarioRepository,
                       UsuarioRolRepository usuarioRolRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.usuarioRolRepository = usuarioRolRepository;
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
}
