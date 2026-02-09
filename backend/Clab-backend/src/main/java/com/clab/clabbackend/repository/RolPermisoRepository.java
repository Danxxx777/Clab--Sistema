package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.RolPermiso;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolPermisoRepository extends JpaRepository<RolPermiso, Integer> {

    boolean existsByRol_IdRolAndModulo_NombreModuloAndPermiso_NombrePermisoAndVigenteTrue(
            Integer idRol,
            String modulo,
            String permiso
    );
} //aaa
