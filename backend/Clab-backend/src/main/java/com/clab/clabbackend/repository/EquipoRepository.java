package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.Equipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
// estoooooo
import java.util.List;

@Repository
public interface EquipoRepository extends JpaRepository<Equipo, Integer> {
    // estoooooo
    List<Equipo> findByLaboratorioCodLaboratorio(Integer codLaboratorio);
}
