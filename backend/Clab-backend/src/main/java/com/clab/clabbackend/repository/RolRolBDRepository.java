package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.RolRolBD;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RolRolBDRepository extends JpaRepository<RolRolBD, Integer> {

    Optional<RolRolBD> findByRol_IdRolAndVigenteTrue(Integer idRol);
}
