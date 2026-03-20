package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.ModuloSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ModuloSistemaRepository extends JpaRepository<ModuloSistema, Integer> {
    List<ModuloSistema> findByActivoTrue();
}