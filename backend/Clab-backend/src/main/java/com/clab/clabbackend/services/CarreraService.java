package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.CarreraDTO;
import com.clab.clabbackend.repository.CarreraRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class CarreraService {

    private final CarreraRepository carreraRepository;
    private final EntityManager entityManager;

    public CarreraService(CarreraRepository carreraRepository, EntityManager entityManager) {
        this.carreraRepository = carreraRepository;
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

    @Transactional
    public void crear(CarreraDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        carreraRepository.insertar(dto.getNombre(), dto.getIdFacultad(), dto.getIdCoordinador());
    }

    @Transactional
    public void editar(Integer idCarrera, CarreraDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        carreraRepository.actualizar(idCarrera, dto.getNombre(), dto.getIdFacultad(),
                dto.getIdCoordinador(), dto.getEstado());
    }

    @Transactional
    public void eliminar(Integer idCarrera, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        carreraRepository.baja(idCarrera);
    }
}
