package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.BloqueoLabDTO;
import com.clab.clabbackend.repository.BloqueoLabRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BloqueoLabService {

    private final BloqueoLabRepository bloqueoLabRepository;

    public BloqueoLabService(BloqueoLabRepository bloqueoLabRepository) {
        this.bloqueoLabRepository = bloqueoLabRepository;
    }

    public List<Map<String, Object>> listar() {
        List<Object[]> rows = bloqueoLabRepository.listar();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new HashMap<>();
            map.put("idBloqueo",                  row[0]);
            map.put("codLaboratorio",             row[1]);
            map.put("nombreLaboratorio",          row[2]);
            map.put("idUsuario",                  row[3]);
            map.put("nombreUsuario",              row[4]);
            map.put("idTipoBloqueo",              row[5]);
            map.put("nombreTipoBloqueo",          row[6]);
            map.put("motivo",                     row[7]);
            map.put("fechaInicio",                row[8]);
            map.put("fechaFin",                   row[9]);
            map.put("afectaReservasExistentes",   row[10]);
            map.put("estado",                     row[11]);
            result.add(map);
        }
        return result;
    }

    public void crear(BloqueoLabDTO dto, Integer idUsuario) {
        bloqueoLabRepository.insertar(
                dto.getCodLaboratorio(),
                idUsuario,
                dto.getIdTipoBloqueo(),
                dto.getMotivo(),
                dto.getFechaInicio(),
                dto.getFechaFin(),
                dto.getEstado()
        );
    }

    public void actualizar(Integer idBloqueo, BloqueoLabDTO dto) {
        bloqueoLabRepository.actualizar(
                idBloqueo,
                dto.getCodLaboratorio(),
                dto.getIdTipoBloqueo(),
                dto.getMotivo(),
                dto.getFechaInicio(),
                dto.getFechaFin(),
                dto.getEstado()
        );
    }

    public void eliminar(Integer idBloqueo) {
        bloqueoLabRepository.eliminar(idBloqueo);
    }
}