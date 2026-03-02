package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.ConfiguracionCorreo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConfiguracionCorreoRepository extends JpaRepository<ConfiguracionCorreo, Integer> {
    Optional<ConfiguracionCorreo> findFirstByActivoTrue();
    Optional<ConfiguracionCorreo> findFirstByPropositoAndActivoTrue(String proposito); // 👈
    List<ConfiguracionCorreo> findAllByOrderByIdConfigAsc();
}