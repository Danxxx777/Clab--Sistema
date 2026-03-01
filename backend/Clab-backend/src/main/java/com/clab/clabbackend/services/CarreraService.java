package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.CarreraDTO;
import com.clab.clabbackend.repository.CarreraRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@Service
public class CarreraService {

    private final CarreraRepository carreraRepository;

    public CarreraService(CarreraRepository carreraRepository) {
        this.carreraRepository = carreraRepository;
    }

    public List<Map<String, Object>> listar() {
        return carreraRepository.listarSP().stream().map(row -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("idCarrera",         row[0]);
            map.put("nombreCarrera",     row[1]);
            map.put("idFacultad",        row[2]);
            map.put("nombreFacultad",    row[3]);
            map.put("idCoordinador",     row[4]);
            map.put("nombreCoordinador", row[5]);
            map.put("estado",            row[6]);
            return map;
        }).toList();
    }

    public List<Map<String, Object>> listarCoordinadores() {
        return carreraRepository.listarCoordinadoresSP().stream().map(row -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("idUsuario",         row[0]);
            map.put("nombreCoordinador", row[1]);
            return map;
        }).toList();
    }

    public void crear(CarreraDTO dto) {
        carreraRepository.insertar(dto.getNombre(), dto.getIdFacultad(), dto.getIdCoordinador());
    }

    public void editar(Integer idCarrera, CarreraDTO dto) {
        carreraRepository.actualizar(
                idCarrera,
                dto.getNombre(),
                dto.getIdFacultad(),
                dto.getIdCoordinador(),
                dto.getEstado()
        );
    }

    public void eliminar(Integer idCarrera) {
        carreraRepository.baja(idCarrera);
    }
}