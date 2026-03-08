package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.EncargadoLaboratorioDTO;
import com.clab.clabbackend.repository.EncargadoLaboratorioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EncargadoLaboratorioService {

    private final EncargadoLaboratorioRepository encargadoLaboratorioRepository;

    public List<Map<String, Object>> listarEncargados() {
        List<Object[]> resultados = encargadoLaboratorioRepository.listarEncargados();
        return resultados.stream().map(r -> {
            Map<String, Object> encargado = new HashMap<>();
            encargado.put("idEncargadoLaboratorio", r[0]);
            encargado.put("identidad", r[1]);
            encargado.put("nombres",   r[2]);
            encargado.put("email",     r[3]);
            encargado.put("telefono",  r[4]);
            encargado.put("nombreLab", r[5]);
            encargado.put("vigente",   r[6]);
            return encargado;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> listarRolEncargados() {
        return encargadoLaboratorioRepository.listarRolEncargados().stream().map(row -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("idUsuario",      row[0]);
            map.put("nombreEncargado",  row[1]);
            return map;
        }).toList();
    }

    public List<Map<String, Object>> listarLaboratorios() {
        return encargadoLaboratorioRepository.listarLaboratorios().stream().map(row -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("codLaboratorio",      row[0]);
            map.put("nombreLab",  row[1]);
            return map;
        }).toList();
    }

    public void insertarEncargado(EncargadoLaboratorioDTO dto) {
        encargadoLaboratorioRepository.insertarEncargado(
                dto.getLaboratorio(),
                dto.getFechaAsignacion(),
                dto.getUsuario(),
                dto.getVigente()
        );
    }

    public void actualizarEncargado(EncargadoLaboratorioDTO dto) {
        encargadoLaboratorioRepository.actualizarEncargado(
                dto.getIdEncargadoLaboratorio(),
                dto.getLaboratorio(),
                dto.getFechaAsignacion(),
                dto.getUsuario(),
                dto.getVigente()
        );
    }

    public void eliminarEncargado(Integer id) {
        encargadoLaboratorioRepository.eliminarEncargado(id);
    }
}
