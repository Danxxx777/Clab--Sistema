package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.DecanoResponseDTO;
import com.clab.clabbackend.dto.FacultadDTO;
import com.clab.clabbackend.dto.FacultadResponseDTO;
import com.clab.clabbackend.repository.FacultadRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FacultadService {

    private final FacultadRepository facultadRepository;
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

    public List<FacultadResponseDTO> listar() {
        return facultadRepository.listarSP().stream().map(r -> new FacultadResponseDTO(
                (Integer) r[0], (String) r[1], (String) r[2], (String) r[3],
                (Integer) r[4], (String) r[5],
                r[6] != null ? ((java.sql.Date) r[6]).toLocalDate() : null
        )).toList();
    }

    public List<DecanoResponseDTO> listarDecanos() {
        return facultadRepository.listarDecanosSP().stream().map(r ->
                new DecanoResponseDTO((Integer) r[0], (String) r[1])
        ).toList();
    }

    @Transactional
    public void crear(FacultadDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        facultadRepository.insertar(dto.getNombre(), dto.getDescripcion(),
                dto.getIdDecano(), dto.getEstado());
    }

    @Transactional
    public void editar(Integer idFacultad, FacultadDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        facultadRepository.actualizar(idFacultad, dto.getNombre(), dto.getDescripcion(),
                dto.getIdDecano(), dto.getEstado());
    }

    @Transactional
    public void eliminar(Integer idFacultad, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        facultadRepository.baja(idFacultad);
    }
}