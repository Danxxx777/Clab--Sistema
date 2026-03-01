package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.HorarioDTO;
import com.clab.clabbackend.repository.HorarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@Service
@RequiredArgsConstructor
public class HorarioService {

    private final HorarioRepository horarioRepository;

    public List<Map<String, Object>> listar() {
        return horarioRepository.listarSP().stream().map(row -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("idHorario",          row[0]);
            map.put("idPeriodo",          row[1]);
            map.put("nombrePeriodo",      row[2]);
            map.put("idAsignatura",       row[3]);
            map.put("nombreAsignatura",   row[4]);
            map.put("idDocente",          row[5]);
            map.put("nombreDocente",      row[6]);
            map.put("diaSemana",          row[7]);
            map.put("horaInicio",         row[8]);
            map.put("horaFin",            row[9]);
            map.put("numeroEstudiantes",  row[10]);
            map.put("fechaCreacion",      row[11]);
            map.put("estado",             row[12]);
            return map;
        }).toList();
    }

    public List<Map<String, Object>> listarDocentes() {
        return horarioRepository.listarDocentesSP().stream().map(row -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("idUsuario",      row[0]);
            map.put("nombreDocente",  row[1]);
            return map;
        }).toList();
    }

    public void crear(HorarioDTO dto) {
        horarioRepository.insertar(
                dto.getIdPeriodo(),
                dto.getIdAsignatura(),
                dto.getIdDocente(),
                dto.getDiaSemana(),
                dto.getHoraInicio(),
                dto.getHoraFin(),
                dto.getNumeroEstudiantes()
        );
    }

    public void editar(Integer idHorario, HorarioDTO dto) {
        horarioRepository.actualizar(
                idHorario,
                dto.getIdPeriodo(),
                dto.getIdAsignatura(),
                dto.getIdDocente(),
                dto.getDiaSemana(),
                dto.getHoraInicio(),
                dto.getHoraFin(),
                dto.getNumeroEstudiantes(),
                dto.getEstado()
        );
    }

    public void eliminar(Integer idHorario) {
        horarioRepository.baja(idHorario);
    }

    public List<Map<String, Object>> listarPorAsignatura(Integer idAsignatura) {
        return horarioRepository.listarSP().stream()
                .filter(row -> row[3] != null && ((Number) row[3]).intValue() == idAsignatura)
                .map(row -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("idHorarioAcademico", row[0]);
                    map.put("idPeriodo",          row[1]);
                    map.put("nombrePeriodo",      row[2]);
                    map.put("idAsignatura",       row[3]);
                    map.put("nombreAsignatura",   row[4]);
                    map.put("idDocente",          row[5]);
                    map.put("nombreDocente",      row[6]);
                    map.put("diaSemana",          row[7]);
                    map.put("horaInicio",         row[8]);
                    map.put("horaFin",            row[9]);
                    map.put("numeroEstudiantes",  row[10]);
                    map.put("fechaCreacion",      row[11]);
                    map.put("estado",             row[12]);
                    return map;
                }).toList();
    }
}