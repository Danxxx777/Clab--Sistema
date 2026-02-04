package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.Laboratorio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LaboratorioRepository extends JpaRepository<Laboratorio, Integer> {

    // Métodos personalizados opcionales
    List<Laboratorio> findBySedeIdSede(Integer idSede);
    List<Laboratorio> findByEstadoLab(String estadoLab);
}