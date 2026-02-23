package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.Rol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RolRepository extends JpaRepository<Rol, Integer> {

    Optional<Rol> findByNombreRol(String nombreRol);
    List<Rol> findByNombreRolNotLike(String prefijo);
}