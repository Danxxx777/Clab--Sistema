package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.TipoReservaDTO;
import com.clab.clabbackend.entities.TipoReserva;
import com.clab.clabbackend.repository.TipoReservaRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TipoReservaService {

    private final TipoReservaRepository tipoReservaRepository;
    private final EntityManager entityManager;

    // ─── CONTEXT ─────────────────────────────────────────────────────────────

    private void setActorContext(Integer actorId, String actorUsuario) {
        entityManager.createNativeQuery(
                        "SELECT set_config('clab.actor_id', :id, true), " +
                                "set_config('clab.actor_usuario', :usuario, true)"
                )
                .setParameter("id",      actorId != null ? actorId.toString() : "0")
                .setParameter("usuario", actorUsuario != null ? actorUsuario : "Sistema")
                .getSingleResult();
    }

    // ─── LISTAR ──────────────────────────────────────────────────────────────

    public List<TipoReserva> listar() {
        List<Object[]> resultados = tipoReservaRepository.listarTipos();
        return resultados.stream().map(r -> {
            TipoReserva tipo = new TipoReserva();
            tipo.setIdTipoReserva((Integer) r[0]);
            tipo.setNombreTipo((String) r[1]);
            tipo.setDescripcion((String) r[2]);
            tipo.setEstado((String) r[3]);
            return tipo;
        }).collect(Collectors.toList());
    }

    // ─── CREAR ───────────────────────────────────────────────────────────────

    @Transactional
    public void crear(TipoReservaDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        tipoReservaRepository.insertar(
                dto.getNombreTipo(),
                dto.getDescripcion()
        );
    }

    // ─── ACTUALIZAR ──────────────────────────────────────────────────────────

    @Transactional
    public void actualizar(Integer id, TipoReservaDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        tipoReservaRepository.actualizar(
                id,
                dto.getNombreTipo(),
                dto.getDescripcion()
        );
    }

    // ─── ELIMINAR ────────────────────────────────────────────────────────────

    @Transactional
    public void eliminar(Integer id, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        tipoReservaRepository.eliminar(id);
    }
}