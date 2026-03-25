package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.CancelacionDTO;
import com.clab.clabbackend.dto.ReservaDTO;
import com.clab.clabbackend.entities.Usuario;
import com.clab.clabbackend.repository.ReservaRepository;
import com.clab.clabbackend.repository.UsuarioRepository;
import com.clab.clabbackend.repository.UsuarioRolRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.clab.clabbackend.dto.ReservaRecurrenteDTO;
import java.sql.Date;
import java.sql.Time;
import java.time.LocalDate;
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
                        "SELECT set_config('clab.actor_id', ?, true), " +
                                "set_config('clab.actor_usuario', ?, true)"
                )
                .setParameter(1, actorId != null ? actorId.toString() : "0")
                .setParameter(2, actorUsuario != null ? actorUsuario : "Sistema")
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

    public List<Map<String, Object>> listarPorSemana(LocalDate inicio, LocalDate fin) {
        return mapearReservas(reservaRepository.listarReservas())
                .stream()
                .filter(r -> {
                    Object fechaObj = r.get("fechaReserva");
                    if (fechaObj == null) return false;
                    LocalDate fecha = (LocalDate) fechaObj;
                    return !fecha.isBefore(inicio) && !fecha.isAfter(fin);
                })
                .collect(Collectors.toList());
    }

    // ─── MAPEO ───────────────────────────────────────────────────────────────

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
            reserva.put("idGrupoReserva",      r[21]);
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

        // Notificar a admins y encargados del lab que hay una nueva solicitud
        try {
            usuarioRepository.findById(dto.getIdUsuario()).ifPresent(solicitante -> {
                String nombreSolicitante = solicitante.getNombres() + " " + solicitante.getApellidos();
                String mensaje = "Nueva solicitud de reserva de <b>" + nombreSolicitante + "</b>" +
                        " para el " + dto.getFechaReserva() + " de " + dto.getHoraInicio() + " a " + dto.getHoraFin();

                usuarioRolRepository.findUsuariosByRolNombre("Administradorr")
                        .forEach(admin -> notificacionService.crearNotificacion(
                                admin, "RESERVA",
                                "Nueva solicitud de reserva",
                                mensaje,
                                "SISTEMA", "Administradorr"));

                usuarioRolRepository.findUsuariosByRolNombre("Encargado de Laboratorio")
                        .forEach(encargado -> notificacionService.crearNotificacion(
                                encargado, "RESERVA",
                                "Nueva solicitud de reserva",
                                mensaje,
                                "SISTEMA", "Encargado de Laboratorio"));
            });
        } catch (Exception e) {
            System.err.println("Error notificación nueva reserva: " + e.getMessage());
        }
    }

    @Transactional
    public void crearAdmin(ReservaDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        reservaRepository.insertarAdmin(
                dto.getCodLaboratorio(), dto.getIdUsuario(), dto.getIdPeriodo(),
                dto.getFechaReserva(), dto.getHoraInicio(), dto.getHoraFin(),
                dto.getMotivo(), dto.getNumeroEstudiantes(), dto.getDescripcion(),
                dto.getIdHorarioAcademico(), dto.getIdAsignatura(), dto.getIdTipoReserva()
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
        List<Object[]> resultado = reservaRepository.obtenerDatosNotificacion(id);
        Object[] datos = resultado != null && !resultado.isEmpty() ? resultado.get(0) : null;

        reservaRepository.aprobar(id);

        try {
            if (datos != null) {
                String labNombre = (String) datos[0];
                String email     = (String) datos[1];
                String fecha     = datos[3] != null ? datos[3].toString() : "";
                String hora      = datos[4] != null ? datos[4].toString() : "";

                // Notificar solo al solicitante
                usuarioRepository.findByEmail(email).ifPresent(usuario ->
                        notificacionService.notificarReservaAprobada(usuario, labNombre, fecha, hora)
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
        List<Object[]> resultado = reservaRepository.obtenerDatosNotificacion(id);
        Object[] datos = resultado != null && !resultado.isEmpty() ? resultado.get(0) : null;

        reservaRepository.rechazar(id);

        try {
            if (datos != null) {
                String labNombre = (String) datos[0];
                String email     = (String) datos[1];

                // Notificar solo al solicitante
                usuarioRepository.findByEmail(email).ifPresent(usuario ->
                        notificacionService.notificarReservaRechazada(usuario, labNombre, "Solicitud no aprobada")
                );
            }
        } catch (Exception e) {
            System.err.println("Error notificación rechazo: " + e.getMessage());
        }
    }

    // ─── CREAR RECURRENTE ────────────────────────────────────────────────────

    @Transactional
    public void crearRecurrente(ReservaRecurrenteDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        reservaRepository.crearRecurrente(
                dto.getCodLaboratorio(),
                dto.getIdUsuario(),
                dto.getIdPeriodo(),
                dto.getIdHorarioAcademico(),
                dto.getIdAsignatura(),
                dto.getIdTipoReserva(),
                dto.getDiasSemana(),
                dto.getHoraInicio(),
                dto.getHoraFin(),
                dto.getMotivo(),
                dto.getNumeroEstudiantes(),
                dto.getDescripcion()
        );
    }

// ─── CANCELAR GRUPO ──────────────────────────────────────────────────────

    @Transactional
    public void cancelarGrupo(Integer idGrupo, CancelacionDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        reservaRepository.cancelarGrupo(
                idGrupo,
                dto.getIdUsuarioCancela(),
                dto.getMotivoCancelacion()
        );
    }

    public List<Map<String, Object>> listarGrupos() {
        return reservaRepository.listarGruposReserva().stream().map(r -> {
            Map<String, Object> grupo = new HashMap<>();
            grupo.put("idGrupo",            r[0]);
            grupo.put("codLaboratorio",     r[1]);
            grupo.put("nombreLaboratorio",  r[2]);
            grupo.put("idUsuario",          r[3]);
            grupo.put("nombreUsuario",      r[4]);
            grupo.put("idPeriodo",          r[5]);
            grupo.put("nombrePeriodo",      r[6]);
            grupo.put("diasSemana",         r[7]);
            grupo.put("horaInicio",         r[8] != null ? ((Time) r[8]).toLocalTime() : null);
            grupo.put("horaFin",            r[9] != null ? ((Time) r[9]).toLocalTime() : null);
            grupo.put("idAsignatura",       r[10]);
            grupo.put("nombreAsignatura",   r[11]);
            grupo.put("idTipoReserva",      r[12]);
            grupo.put("nombreTipoReserva",  r[13]);
            grupo.put("motivo",             r[14]);
            grupo.put("numeroEstudiantes",  r[15]);
            grupo.put("descripcion",        r[16]);
            grupo.put("estado",             r[17]);
            grupo.put("totalReservas",      r[18]);
            grupo.put("fechaCreacion",      r[19] != null ? ((Date) r[19]).toLocalDate() : null);
            return grupo;
        }).collect(Collectors.toList());
    }

    // ─── APROBAR GRUPO ───────────────────────────────────────────────────────

    @Transactional
    public void aprobarGrupo(Integer idGrupo, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        reservaRepository.aprobarGrupo(idGrupo);
    }

// ─── RECHAZAR GRUPO ──────────────────────────────────────────────────────

    @Transactional
    public void rechazarGrupo(Integer idGrupo, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        reservaRepository.rechazarGrupo(idGrupo);
    }
}