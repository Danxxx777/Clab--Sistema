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

    private void setActorContext(Integer actorId, String actorUsuario) {
        try {
            entityManager.createNativeQuery(
                            "SELECT set_config('clab.actor_id', :id, true), " +
                                    "set_config('clab.actor_usuario', :usuario, true)"
                    )
                    .setParameter("id",      actorId != null ? actorId.toString() : "0")
                    .setParameter("usuario", actorUsuario != null ? actorUsuario : "Sistema")
                    .getSingleResult();
        } catch (Exception e) {
            // ignorar
        }
    }

    @SuppressWarnings("unchecked")
    public List<TipoReserva> listar() {
        List<Object[]> resultados = entityManager
                .createNativeQuery("SELECT id_tipo_reserva, nombre_tipo, descripcion, estado, requiere_asignatura FROM reservas.r_tipo_reserva WHERE estado = 'Activo'")
                .getResultList();

        return resultados.stream().map(r -> {
            TipoReserva tipo = new TipoReserva();
            tipo.setIdTipoReserva(r[0] != null ? ((Number) r[0]).intValue() : null);
            tipo.setNombreTipo(r[1] != null ? r[1].toString() : "");
            tipo.setDescripcion(r[2] != null ? r[2].toString() : "");
            tipo.setEstado(r[3] != null ? r[3].toString() : "");
            tipo.setRequiereAsignatura(r[4] instanceof Boolean ? (Boolean) r[4]
                    : r[4] != null ? Boolean.parseBoolean(r[4].toString()) : true);
            return tipo;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void crear(TipoReservaDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        entityManager.createNativeQuery(
                        "INSERT INTO reservas.r_tipo_reserva (nombre_tipo, descripcion, estado, requiere_asignatura) " +
                                "VALUES (:nombre, :desc, 'Activo', :req)"
                )
                .setParameter("nombre", dto.getNombreTipo())
                .setParameter("desc",   dto.getDescripcion() != null ? dto.getDescripcion() : "")
                .setParameter("req",    dto.getRequiereAsignatura() != null ? dto.getRequiereAsignatura() : true)
                .executeUpdate();
    }

    @Transactional
    public void actualizar(Integer id, TipoReservaDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        entityManager.createNativeQuery(
                        "UPDATE reservas.r_tipo_reserva SET nombre_tipo = :nombre, descripcion = :desc, " +
                                "requiere_asignatura = :req WHERE id_tipo_reserva = :id"
                )
                .setParameter("id",     id)
                .setParameter("nombre", dto.getNombreTipo())
                .setParameter("desc",   dto.getDescripcion() != null ? dto.getDescripcion() : "")
                .setParameter("req",    dto.getRequiereAsignatura() != null ? dto.getRequiereAsignatura() : true)
                .executeUpdate();
    }

    @Transactional
    public void eliminar(Integer id, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        tipoReservaRepository.eliminar(id);
    }
}