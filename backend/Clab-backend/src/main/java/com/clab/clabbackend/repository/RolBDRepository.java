package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.RolBD;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RolBDRepository extends JpaRepository<RolBD, Integer> {

    Optional<RolBD> findByNombreRolBd(String nombreRolBd);

}