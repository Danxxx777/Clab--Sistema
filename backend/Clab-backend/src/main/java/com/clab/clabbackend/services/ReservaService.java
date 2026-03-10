package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.CancelacionDTO;
import com.clab.clabbackend.dto.ReservaDTO;
import com.clab.clabbackend.repository.ReservaRepository;
import com.clab.clabbackend.repository.UsuarioRepository;
import com.clab.clabbackend.repository.UsuarioRolRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.sql.Time;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioRolRepository usuarioRolRepository;
    private final NotificacionService notificacionService;
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

    public List<Map<String, Object>> listar() {
        return mapearReservas(reservaRepository.listarReservas());
    }

    public List<Map<String, Object>> listarPorUsuario(Integer idUsuario) {
        return mapearReservas(reservaRepository.listarReservasPorUsuario(idUsuario));
    }

    public List<Map<String, Object>> listarPorEncargado(Integer idUsuario) {
        return mapearReservas(reservaRepository.listarReservasPorEncargado(idUsuario));
    }

    private List<Map<String, Object>> mapearReservas(List<Object[]> resultados) {
        return resultados.stream().map(r -> {
            Map<String, Object> reserva = new HashMap<>();
            reserva.put("idReserva",          r[0]);
            reserva.put("codLaboratorio",      r[1]);
            reserva.put("nombreLaboratorio",   r[2]);
            reserva.put("idUsuario",           r[3]);
            reserva.put("nombreUsuario",       r[4]);
            reserva.put("idPeriodo",           r[5]);
            reserva.put("nombrePeriodo",       r[6]);
            reserva.put("idHorarioAcademico",  r[7]);
            reserva.put("idAsignatura",        r[8]);
            reserva.put("nombreAsignatura",    r[9]);
            reserva.put("idTipoReserva",       r[10]);
            reserva.put("nombreTipoReserva",   r[11]);
            reserva.put("fechaReserva",        r[12] != null ? ((Date) r[12]).toLocalDate() : null);
            reserva.put("horaInicio",          r[13] != null ? ((Time) r[13]).toLocalTime() : null);
            reserva.put("horaFin",             r[14] != null ? ((Time) r[14]).toLocalTime() : null);
            reserva.put("motivo",              r[15]);
            reserva.put("numeroEstudiantes",   r[16]);
            reserva.put("estado",              r[17]);
            reserva.put("descripcion",         r[18]);
            reserva.put("fechaSolicitud",      r[19] != null ? ((Date) r[19]).toLocalDate() : null);
            reserva.put("fechaConfirmacion",   r[20] != null ? ((Date) r[20]).toLocalDate() : null);
            return reserva;
        }).collect(Collectors.toList());
    }

    // ─── CREAR ───────────────────────────────────────────────────────────────

    @Transactional
    public void crear(ReservaDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        reservaRepository.insertar(
                dto.getCodLaboratorio(), dto.getIdUsuario(), dto.getIdPeriodo(),
                dto.getIdHorarioAcademico(), dto.getIdAsignatura(), dto.getIdTipoReserva(),
                dto.getFechaReserva(), dto.getHoraInicio(), dto.getHoraFin(),
                dto.getMotivo(), dto.getNumeroEstudiantes(), dto.getDescripcion()
        );
    }

    @Transactional
    public void crearAdmin(ReservaDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        reservaRepository.insertarAdmin(
                dto.getCodLaboratorio(), dto.getIdUsuario(), dto.getIdPeriodo(),
                dto.getIdHorarioAcademico(), dto.getIdAsignatura(), dto.getIdTipoReserva(),
                dto.getFechaReserva(), dto.getHoraInicio(), dto.getHoraFin(),
                dto.getMotivo(), dto.getNumeroEstudiantes(), dto.getDescripcion()
        );
    }

    // ─── ACTUALIZAR ──────────────────────────────────────────────────────────

    @Transactional
    public void actualizar(Integer id, ReservaDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        reservaRepository.actualizar(
                id, dto.getFechaReserva(), dto.getHoraInicio(), dto.getHoraFin(),
                dto.getMotivo(), dto.getNumeroEstudiantes(), dto.getDescripcion()
        );
    }

    // ─── CANCELAR ────────────────────────────────────────────────────────────

    @Transactional
    public void cancelar(CancelacionDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        reservaRepository.cancelar(
                dto.getIdReserva(),
                dto.getIdUsuarioCancela(),
                dto.getMotivoCancelacion()
        );
    }

    // ─── APROBAR ─────────────────────────────────────────────────────────────

    @Transactional
    public void aprobar(Integer id, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        Object[] datos = reservaRepository.obtenerDatosNotificacion(id);
        reservaRepository.aprobar(id);

        try {
            if (datos != null) {
                String labNombre = (String) datos[0];
                String email     = (String) datos[1];
                String fecha     = datos[3] != null ? datos[3].toString() : "";
                String hora      = datos[4] != null ? datos[4].toString() : "";

                usuarioRepository.findByEmail(email).ifPresent(usuario ->
                        notificacionService.notificarReservaAprobada(usuario, labNombre, fecha, hora)
                );

                usuarioRolRepository.findUsuariosByRolNombre("Administradorr")
                        .forEach(admin ->
                                notificacionService.crearNotificacion(
                                        admin, "RESERVA",
                                        "Reserva aprobada en " + labNombre,
                                        "Se aprobó una reserva para el " + fecha + " a las " + hora,
                                        "SISTEMA", "Administradorr")
                        );
            }
        } catch (Exception e) {
            System.err.println("Error notificación aprobación: " + e.getMessage());
        }
    }

    // ─── RECHAZAR ────────────────────────────────────────────────────────────

    @Transactional
    public void rechazar(Integer id, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        Object[] datos = reservaRepository.obtenerDatosNotificacion(id);
        reservaRepository.rechazar(id);

        try {
            if (datos != null) {
                String labNombre = (String) datos[0];
                String email     = (String) datos[1];

                usuarioRepository.findByEmail(email).ifPresent(usuario ->
                        notificacionService.notificarReservaRechazada(usuario, labNombre, "Solicitud no aprobada")
                );

                usuarioRolRepository.findUsuariosByRolNombre("Administradorr")
                        .forEach(admin ->
                                notificacionService.crearNotificacion(
                                        admin, "RESERVA",
                                        "Reserva rechazada en " + labNombre,
                                        "Se rechazó una solicitud de reserva en " + labNombre,
                                        "SISTEMA", "Administradorr")
                        );
            }
        } catch (Exception e) {
            System.err.println("Error notificación rechazo: " + e.getMessage());
        }
    }
}