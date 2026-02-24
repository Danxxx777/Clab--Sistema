package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.RolRolBD;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RolRolBDRepository extends JpaRepository<RolRolBD, Integer> {

    List<RolRolBD> findByRol_IdRolAndVigenteTrue(Integer idRol);
    void deleteByRol_IdRol(Integer idRol);
}
//a