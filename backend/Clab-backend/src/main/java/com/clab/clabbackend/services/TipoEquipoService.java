package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.TipoEquipoDTO;
import com.clab.clabbackend.entities.TipoEquipo;
import com.clab.clabbackend.repository.TipoEquipoRepository;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TipoEquipoService {

    @Autowired
    private TipoEquipoRepository tipoEquipoRepository;

    @Autowired
    private EntityManager entityManager;

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

    public List<TipoEquipo> listar() {
        return tipoEquipoRepository.listarActivos();
    }

    // ─── CREAR ───────────────────────────────────────────────────────────────

    @Transactional
    public void crear(TipoEquipoDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        tipoEquipoRepository.insertar(
                dto.getNombre(),
                dto.getDescripcion()
        );
    }

    // ─── ACTUALIZAR ──────────────────────────────────────────────────────────

    @Transactional
    public void actualizar(Integer id, TipoEquipoDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        tipoEquipoRepository.actualizarSP(
                id,
                dto.getNombre(),
                dto.getDescripcion()
        );
    }

    // ─── BAJA LÓGICA ─────────────────────────────────────────────────────────

    @Transactional
    public void eliminar(Integer id, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        tipoEquipoRepository.baja(id);
    }
}