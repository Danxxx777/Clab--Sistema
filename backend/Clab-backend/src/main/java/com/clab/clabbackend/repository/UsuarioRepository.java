package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByUsuarioAndEstado(String usuario, String estado);
}