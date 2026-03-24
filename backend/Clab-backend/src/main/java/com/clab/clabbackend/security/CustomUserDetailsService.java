package com.clab.clabbackend.security;

import com.clab.clabbackend.entities.Usuario;
import com.clab.clabbackend.repository.UsuarioRepository;
import org.springframework.dao.DataAccessException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    private boolean bdTieneStoredProcs() {
        try {
            Long count = (Long) entityManager
                    .createNativeQuery("SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'usuarios'")
                    .getSingleResult();
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        // Si la BD no tiene stored procs, está vacía — bloquear login
        if (!bdTieneStoredProcs()) {
            throw new UsernameNotFoundException("__BD_VACIA__");
        }

        try {
            Usuario usuario = usuarioRepository.findByUsuarioAndEstado(username, "ACTIVO")
                    .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
            return User.builder()
                    .username(usuario.getUsuario())
                    .password(usuario.getContrasenia())
                    .authorities("USER")
                    .build();
        } catch (UsernameNotFoundException e) {
            throw e;
        } catch (DataAccessException e) {
            throw new UsernameNotFoundException("__BD_VACIA__");
        }
    }
}