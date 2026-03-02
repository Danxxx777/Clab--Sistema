package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.UsuarioRol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRolRepository extends JpaRepository<UsuarioRol, Integer> {
    Optional<UsuarioRol> findByUsuario_IdUsuarioAndVigenteTrue(Integer idUsuario);
    List<UsuarioRol> findAllByUsuario_IdUsuarioAndVigenteTrue(Integer idUsuario); // 👈 nuevo
    void deleteByRol_IdRol(Integer idRol);
}