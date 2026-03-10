package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.HorarioDTO;
import com.clab.clabbackend.repository.HorarioRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HorarioService {

    private final HorarioRepository horarioRepository;
    private final EntityManager entityManager;

    private void setActorContext(Integer actorId, String actorUsuario) {
        entityManager.createNativeQuery(
                        "SELECT set_config('clab.actor_id', :id, true), " +
                                "set_config('clab.actor_usuario', :usuario, true)"
                )
                .setParameter("id",      actorId != null ? actorId.toString() : "0")
                .setParameter("usuario", actorUsuario != null ? actorUsuario : "Sistema")
                .getSingleResult();
    }

    public List<Map<String, Object>> listar() {
        return mapearHorarios(horarioRepository.listarSP());
    }

    public List<Map<String, Object>> listarDocentes() {
        return horarioRepository.listarDocentesSP().stream().map(row -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("idUsuario",     row[0]);
            map.put("nombreDocente", row[1]);
            return map;
        }).toList();
    }

    public List<Map<String, Object>> listarPorAsignatura(Integer idAsignatura) {
        return horarioRepository.listarSP().stream()
                .filter(row -> row[3] != null && ((Number) row[3]).intValue() == idAsignatura)
                .map(row -> {
                    Map<String, Object> map = mapearFila(row);
                    map.put("idHorarioAcademico", row[0]);
                    return map;
                }).toList();
    }

    @Transactional
    public void crear(HorarioDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        horarioRepository.insertar(dto.getIdPeriodo(), dto.getIdAsignatura(), dto.getIdDocente(),
                dto.getDiaSemana(), dto.getHoraInicio(), dto.getHoraFin(), dto.getNumeroEstudiantes());
    }

    @Transactional
    public void editar(Integer idHorario, HorarioDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        horarioRepository.actualizar(idHorario, dto.getIdPeriodo(), dto.getIdAsignatura(),
                dto.getIdDocente(), dto.getDiaSemana(), dto.getHoraInicio(), dto.getHoraFin(),
                dto.getNumeroEstudiantes(), dto.getEstado());
    }

    @Transactional
    public void eliminar(Integer idHorario, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        horarioRepository.baja(idHorario);
    }

    private List<Map<String, Object>> mapearHorarios(List<Object[]> rows) {
        return rows.stream().map(this::mapearFila).toList();
    }

    private Map<String, Object> mapearFila(Object[] row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("idHorario",         row[0]);
        map.put("idPeriodo",         row[1]);
        map.put("nombrePeriodo",     row[2]);
        map.put("idAsignatura",      row[3]);
        map.put("nombreAsignatura",  row[4]);
        map.put("idDocente",         row[5]);
        map.put("nombreDocente",     row[6]);
        map.put("diaSemana",         row[7]);
        map.put("horaInicio",        row[8]);
        map.put("horaFin",           row[9]);
        map.put("numeroEstudiantes", row[10]);
        map.put("fechaCreacion",     row[11]);
        map.put("estado",            row[12]);
        return map;
    }
}
















