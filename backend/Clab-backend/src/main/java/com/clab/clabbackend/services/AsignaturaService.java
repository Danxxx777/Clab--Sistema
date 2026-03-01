package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.AsignaturaDTO;
import com.clab.clabbackend.repository.AsignaturaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@Service
@RequiredArgsConstructor
public class AsignaturaService {

    private final AsignaturaRepository asignaturaRepository;

    public List<Map<String, Object>> listar() {
        return asignaturaRepository.listarSP().stream().map(row -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("idAsignatura",        row[0]);
            map.put("nombre",              row[1]);
            map.put("idCarrera",           row[2]);
            map.put("nombreCarrera",       row[3]);
            map.put("nivel",               row[4]);
            map.put("horasSemanales",      row[5]);
            map.put("requiereLaboratorio", row[6]);
            map.put("estado",              row[7]);
            return map;
        }).toList();
    }

    public void crear(AsignaturaDTO dto) {
        asignaturaRepository.insertar(
                dto.getNombre(),
                dto.getIdCarrera(),
                dto.getNivel(),
                dto.getHorasSemanales(),
                dto.getRequiereLaboratorio()
        );
    }

    public void editar(Integer idAsignatura, AsignaturaDTO dto) {
        asignaturaRepository.actualizar(
                idAsignatura,
                dto.getNombre(),
                dto.getIdCarrera(),
                dto.getNivel(),
                dto.getHorasSemanales(),
                dto.getRequiereLaboratorio(),
                dto.getEstado()
        );
    }

    public void eliminar(Integer idAsignatura) {
        asignaturaRepository.baja(idAsignatura);
    }
}