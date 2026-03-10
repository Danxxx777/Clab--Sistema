package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.PerioDTO;
import com.clab.clabbackend.entities.PeriodoAcademico;
import com.clab.clabbackend.repository.PeriodoAcademicoRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PeriodoAcademicoService {

    private final PeriodoAcademicoRepository periodoAcademicoRepository;
    private final EntityManager entityManager;

    public PeriodoAcademicoService(PeriodoAcademicoRepository periodoAcademicoRepository,
                                   EntityManager entityManager) {
        this.periodoAcademicoRepository = periodoAcademicoRepository;
        this.entityManager = entityManager;
    }

    private void setActorContext(Integer actorId, String actorUsuario) {
        entityManager.createNativeQuery(
                        "SELECT set_config('clab.actor_id', :id, true), " +
                                "set_config('clab.actor_usuario', :usuario, true)"
                )
                .setParameter("id",      actorId != null ? actorId.toString() : "0")
                .setParameter("usuario", actorUsuario != null ? actorUsuario : "Sistema")
                .getSingleResult();
    }

    public List<PeriodoAcademico> listar() {
        return periodoAcademicoRepository.findAll();
    }

    @Transactional
    public PeriodoAcademico crear(PerioDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        PeriodoAcademico pa = new PeriodoAcademico();
        pa.setNombrePeriodo(dto.getNombrePeriodo());
        pa.setFechaInicio(dto.getFechaInicio());
        pa.setFechaFin(dto.getFechaFin());
        pa.setFechaCreacion(dto.getFechaCreacion());
        pa.setEstado(dto.getEstado());
        return periodoAcademicoRepository.save(pa);
    }

    @Transactional
    public PeriodoAcademico editar(Integer id, PerioDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        PeriodoAcademico pa = periodoAcademicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se encontró el id"));
        pa.setNombrePeriodo(dto.getNombrePeriodo());
        pa.setFechaInicio(dto.getFechaInicio());
        pa.setFechaFin(dto.getFechaFin());
        pa.setFechaCreacion(dto.getFechaCreacion());
        pa.setEstado(dto.getEstado());
        return periodoAcademicoRepository.save(pa);
    }

    @Transactional
    public void eliminar(Integer id, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        PeriodoAcademico pa = periodoAcademicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se encontró el periodo con id: " + id));
        periodoAcademicoRepository.delete(pa);
    }
}