package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.Modulo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ModuloRepository extends JpaRepository<Modulo, Integer> {
    Optional<Modulo> findByNombreModulo(String nombreModulo);
}