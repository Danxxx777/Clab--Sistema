package com.clab.clabbackend.security;

import com.clab.clabbackend.entities.Usuario;
import com.clab.clabbackend.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {

        Usuario usuario = usuarioRepository
                .findByUsuarioAndEstado(username, "ACTIVO")
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        return User.builder()
                .username(usuario.getUsuario())
                .password(usuario.getContrasenia()) // 🔥 ENCRIPTADA
                .authorities("USER")
                .build();
    }
}
