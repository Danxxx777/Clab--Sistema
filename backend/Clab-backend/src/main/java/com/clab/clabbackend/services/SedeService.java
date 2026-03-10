package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.SedeDTO;
import com.clab.clabbackend.entities.Sede;
import com.clab.clabbackend.repository.SedeRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SedeService {

    private final SedeRepository sedeRepository;
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

    public List<Sede> listar() {
        List<Object[]> resultados = sedeRepository.listarSedes();
        return resultados.stream().map(r -> {
            Sede sede = new Sede();
            sede.setIdSede((Integer) r[0]);
            sede.setNombre((String) r[1]);
            sede.setDireccion((String) r[2]);
            sede.setTelefono((String) r[3]);
            sede.setEmail((String) r[4]);
            sede.setEstado((String) r[5]);
            return sede;
        }).collect(Collectors.toList());
    }

    // ─── CREAR ───────────────────────────────────────────────────────────────

    @Transactional
    public void crear(SedeDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        sedeRepository.insertar(
                dto.getNombre(),
                dto.getDireccion(),
                dto.getTelefono(),
                dto.getEmail()
        );
    }

    // ─── ACTUALIZAR ──────────────────────────────────────────────────────────

    @Transactional
    public void actualizar(Integer id, SedeDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        sedeRepository.actualizar(
                id,
                dto.getNombre(),
                dto.getDireccion(),
                dto.getTelefono(),
                dto.getEmail()
        );
    }

    // ─── ELIMINAR ────────────────────────────────────────────────────────────

    @Transactional
    public void eliminar(Integer id, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        sedeRepository.eliminar(id);
    }
}