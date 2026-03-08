package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.RolBdEsquemaPermiso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RolBdEsquemaPermisoRepository
        extends JpaRepository<RolBdEsquemaPermiso, Integer> {

    List<RolBdEsquemaPermiso> findByRolBd_IdRolBdAndVigenteTrue(Integer idRolBd);
}