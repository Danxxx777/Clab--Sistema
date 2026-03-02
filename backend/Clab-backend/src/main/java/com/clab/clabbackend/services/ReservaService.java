package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.CancelacionDTO;
import com.clab.clabbackend.dto.ReservaDTO;
import com.clab.clabbackend.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;

    // LISTAR
    public List<Map<String, Object>> listar() {
        List<Object[]> resultados = reservaRepository.listarReservas();

        return resultados.stream().map(r -> {
            Map<String, Object> reserva = new HashMap<>();
            reserva.put("idReserva", r[0]);
            reserva.put("codLaboratorio", r[1]);
            reserva.put("nombreLaboratorio", r[2]);
            reserva.put("idUsuario", r[3]);
            reserva.put("nombreUsuario", r[4]);
            reserva.put("idPeriodo", r[5]);
            reserva.put("nombrePeriodo", r[6]);
            reserva.put("idHorarioAcademico", r[7]);
            reserva.put("idAsignatura", r[8]);
            reserva.put("nombreAsignatura", r[9]);
            reserva.put("idTipoReserva", r[10]);
            reserva.put("nombreTipoReserva", r[11]);

            reserva.put("fechaReserva", r[12] != null ? ((Date) r[12]).toLocalDate() : null);

            reserva.put("horaInicio", r[13] != null ? ((Time) r[13]).toLocalTime() : null);
            reserva.put("horaFin", r[14] != null ? ((Time) r[14]).toLocalTime() : null);

            reserva.put("motivo", r[15]);
            reserva.put("numeroEstudiantes", r[16]);
            reserva.put("estado", r[17]);
            reserva.put("descripcion", r[18]);

            reserva.put("fechaSolicitud", r[19] != null ? ((Date) r[19]).toLocalDate() : null);
            reserva.put("fechaConfirmacion", r[20] != null ? ((Date) r[20]).toLocalDate() : null);

            return reserva;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> listarPorUsuario(Integer idUsuario) {
        List<Object[]> resultados = reservaRepository.listarReservasPorUsuario(idUsuario);
        return resultados.stream().map(r -> {
            Map<String, Object> reserva = new HashMap<>();
            reserva.put("idReserva", r[0]);
            reserva.put("codLaboratorio", r[1]);
            reserva.put("nombreLaboratorio", r[2]);
            reserva.put("idUsuario", r[3]);
            reserva.put("nombreUsuario", r[4]);
            reserva.put("idPeriodo", r[5]);
            reserva.put("nombrePeriodo", r[6]);
            reserva.put("idHorarioAcademico", r[7]);
            reserva.put("idAsignatura", r[8]);
            reserva.put("nombreAsignatura", r[9]);
            reserva.put("idTipoReserva", r[10]);
            reserva.put("nombreTipoReserva", r[11]);
            reserva.put("fechaReserva", r[12] != null ? ((Date) r[12]).toLocalDate() : null);
            reserva.put("horaInicio", r[13] != null ? ((Time) r[13]).toLocalTime() : null);
            reserva.put("horaFin", r[14] != null ? ((Time) r[14]).toLocalTime() : null);
            reserva.put("motivo", r[15]);
            reserva.put("numeroEstudiantes", r[16]);
            reserva.put("estado", r[17]);
            reserva.put("descripcion", r[18]);
            reserva.put("fechaSolicitud", r[19] != null ? ((Date) r[19]).toLocalDate() : null);
            reserva.put("fechaConfirmacion", r[20] != null ? ((Date) r[20]).toLocalDate() : null);
            return reserva;
        }).collect(Collectors.toList());
    }

    // CREAR
    public void crear(ReservaDTO dto) {
        reservaRepository.insertar(
                dto.getCodLaboratorio(),
                dto.getIdUsuario(),
                dto.getIdPeriodo(),
                dto.getIdHorarioAcademico(),
                dto.getIdAsignatura(),
                dto.getIdTipoReserva(),
                dto.getFechaReserva(),
                dto.getHoraInicio(),
                dto.getHoraFin(),
                dto.getMotivo(),
                dto.getNumeroEstudiantes(),
                dto.getDescripcion()
        );
    }

    public void crearAdmin(ReservaDTO dto) {
        reservaRepository.insertarAdmin(
                dto.getCodLaboratorio(),
                dto.getIdUsuario(),
                dto.getIdPeriodo(),
                dto.getIdHorarioAcademico(),
                dto.getIdAsignatura(),
                dto.getIdTipoReserva(),
                dto.getFechaReserva(),
                dto.getHoraInicio(),
                dto.getHoraFin(),
                dto.getMotivo(),
                dto.getNumeroEstudiantes(),
                dto.getDescripcion()
        );
    }

    // ACTUALIZAR
    public void actualizar(Integer id, ReservaDTO dto) {
        reservaRepository.actualizar(
                id,
                dto.getFechaReserva(),
                dto.getHoraInicio(),
                dto.getHoraFin(),
                dto.getMotivo(),
                dto.getNumeroEstudiantes(),
                dto.getDescripcion()
        );
    }

    // CANCELAR
    public void cancelar(CancelacionDTO dto) {
        reservaRepository.cancelar(
                dto.getIdReserva(),
                dto.getIdUsuarioCancela(),
                dto.getMotivoCancelacion()
        );
    }

    // APROBAR
    public void aprobar(Integer id) {
        reservaRepository.aprobar(id);
    }

    // RECHAZAR
    public void rechazar(Integer id) {
        reservaRepository.rechazar(id);
    }
}