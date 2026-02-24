package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.UsuarioRol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRolRepository extends JpaRepository<UsuarioRol, Integer> {

    Optional<UsuarioRol> findByUsuario_IdUsuarioAndVigenteTrue(Integer idUsuario);
    void deleteByRol_IdRol(Integer idRol);
}

//a