package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.Usuario;
import com.clab.clabbackend.entities.UsuarioRol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsuarioRolRepository extends JpaRepository<UsuarioRol, Integer> {
    Optional<UsuarioRol> findByUsuario_IdUsuarioAndVigenteTrue(Integer idUsuario);

    List<UsuarioRol> findAllByUsuario_IdUsuarioAndVigenteTrue(Integer idUsuario);

    void deleteByRol_IdRol(Integer idRol);

    @Query("SELECT ur.usuario FROM UsuarioRol ur WHERE ur.rol.nombreRol = :nombreRol AND ur.vigente = true")
    List<Usuario> findUsuariosByRolNombre(@Param("nombreRol") String nombreRol);

}