package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.TipoEquipo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TipoEquipoRepository extends JpaRepository<TipoEquipo, Integer> {

    Optional<TipoEquipo> findByNombreTipo(String nombreTipo);

}
