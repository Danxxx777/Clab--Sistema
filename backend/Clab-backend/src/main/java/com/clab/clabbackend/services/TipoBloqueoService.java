package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.TipoBloqueoDTO;
import com.clab.clabbackend.entities.TipoBloqueo;
import com.clab.clabbackend.repository.TipoBloqueoRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TipoBloqueoService {

    private final TipoBloqueoRepository tipoBloqueoRepository;
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

    public List<TipoBloqueo> listar() {
        return tipoBloqueoRepository.listarTipos().stream().map(r -> {
            TipoBloqueo t = new TipoBloqueo();
            t.setIdTipoBloqueo((Integer) r[0]);
            t.setNombreTipo((String) r[1]);
            t.setDescripcion((String) r[2]);
            t.setEstado((String) r[3]);
            return t;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void crear(TipoBloqueoDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        tipoBloqueoRepository.insertar(dto.getNombreTipo(), dto.getDescripcion(), dto.getEstado());
    }

    @Transactional
    public void actualizar(Integer id, TipoBloqueoDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        tipoBloqueoRepository.actualizar(id, dto.getNombreTipo(), dto.getDescripcion(), dto.getEstado());
    }

    @Transactional
    public void eliminar(Integer id, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        tipoBloqueoRepository.eliminar(id);
    }
}
