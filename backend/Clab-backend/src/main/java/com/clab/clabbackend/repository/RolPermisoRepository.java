package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.RolPermiso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RolPermisoRepository extends JpaRepository<RolPermiso, Integer> {

    boolean existsByRol_IdRolAndPermiso_NombrePermisoAndVigenteTrue(Integer idRol, String nombrePermiso);
    void deleteByRol_IdRol(Integer idRol);
    List<RolPermiso> findByRol_IdRolAndVigenteTrue(Integer idRol);
}

