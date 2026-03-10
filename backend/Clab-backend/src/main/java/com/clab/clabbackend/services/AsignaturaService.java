package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.AsignaturaDTO;
import com.clab.clabbackend.repository.AsignaturaRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AsignaturaService {

    private final AsignaturaRepository asignaturaRepository;
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

    @Transactional
    public void crear(AsignaturaDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        asignaturaRepository.insertar(dto.getNombre(), dto.getIdCarrera(), dto.getNivel(),
                dto.getHorasSemanales(), dto.getRequiereLaboratorio());
    }

    @Transactional
    public void editar(Integer idAsignatura, AsignaturaDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        asignaturaRepository.actualizar(idAsignatura, dto.getNombre(), dto.getIdCarrera(),
                dto.getNivel(), dto.getHorasSemanales(), dto.getRequiereLaboratorio(), dto.getEstado());
    }

    @Transactional
    public void eliminar(Integer idAsignatura, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        asignaturaRepository.baja(idAsignatura);
    }
}