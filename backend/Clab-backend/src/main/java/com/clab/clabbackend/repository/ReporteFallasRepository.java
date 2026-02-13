package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.ReporteFallas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReporteFallasRepository extends JpaRepository<ReporteFallas, Integer> {

    List<ReporteFallas> findByLaboratorioCodLaboratorio(Integer codLaboratorio);

    List<ReporteFallas> findByEquipoIdEquipo(Integer idEquipo);

    List<ReporteFallas> findByUsuarioIdUsuario(Integer idUsuario);
}
