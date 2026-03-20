package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.ModuloRol;
import com.clab.clabbackend.entities.ModuloRolId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ModuloRolRepository extends JpaRepository<ModuloRol, ModuloRolId> {
    List<ModuloRol> findByRol_IdRol(Integer idRol);
    void deleteByRol_IdRol(Integer idRol);
}