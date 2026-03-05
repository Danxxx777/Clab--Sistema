package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Integer> {

    // LISTAR
    @Query(value = "SELECT * FROM reservas.fn_listar_reservas()", nativeQuery = true)
    List<Object[]> listarReservas();

    @Query(value = "SELECT * FROM reservas.fn_listar_reservas_usuario(:idUsuario)", nativeQuery = true)
    List<Object[]> listarReservasPorUsuario(Integer idUsuario);

    // INSERTAR
    @Transactional
    @Modifying
    @Query(value = "CALL reservas.sp_insertar_reserva(" +
            ":codLaboratorio, :idUsuario, :idPeriodo, :idHorarioAcademico, " +
            ":idAsignatura, :idTipoReserva, :fechaReserva, :horaInicio, " +
            ":horaFin, :motivo, :numeroEstudiantes, :descripcion)",
            nativeQuery = true)
    void insertar(
            Integer codLaboratorio,
            Integer idUsuario,
            Integer idPeriodo,
            Integer idHorarioAcademico,
            Integer idAsignatura,
            Integer idTipoReserva,
            LocalDate fechaReserva,
            LocalTime horaInicio,
            LocalTime horaFin,
            String motivo,
            Integer numeroEstudiantes,
            String descripcion
    );

    @Transactional
    @Modifying
    @Query(value = "CALL reservas.sp_insertar_reserva_admin(" +
            ":codLaboratorio, :idUsuario, :idPeriodo, :idHorarioAcademico, " +
            ":idAsignatura, :idTipoReserva, :fechaReserva, :horaInicio, " +
            ":horaFin, :motivo, :numeroEstudiantes, :descripcion)",
            nativeQuery = true)
    void insertarAdmin(
            Integer codLaboratorio,
            Integer idUsuario,
            Integer idPeriodo,
            Integer idHorarioAcademico,
            Integer idAsignatura,
            Integer idTipoReserva,
            LocalDate fechaReserva,
            LocalTime horaInicio,
            LocalTime horaFin,
            String motivo,
            Integer numeroEstudiantes,
            String descripcion
    );

    // ACTUALIZAR
    @Transactional
    @Modifying
    @Query(value = "CALL reservas.sp_actualizar_reserva(" +
            ":idReserva, :fechaReserva, :horaInicio, :horaFin, " +
            ":motivo, :numeroEstudiantes, :descripcion)",
            nativeQuery = true)
    void actualizar(
            Integer idReserva,
            LocalDate fechaReserva,
            LocalTime horaInicio,
            LocalTime horaFin,
            String motivo,
            Integer numeroEstudiantes,
            String descripcion
    );

    // CANCELAR
    @Transactional
    @Modifying
    @Query(value = "CALL reservas.sp_cancelar_reserva(" +
            ":idReserva, :idUsuarioCancela, :motivoCancelacion)",
            nativeQuery = true)
    void cancelar(
            Integer idReserva,
            Integer idUsuarioCancela,
            String motivoCancelacion
    );

    // APROBAR
    @Transactional
    @Modifying
    @Query(value = "CALL reservas.sp_aprobar_reserva(:idReserva)", nativeQuery = true)
    void aprobar(Integer idReserva);

    // RECHAZAR
    @Transactional
    @Modifying
    @Query(value = "CALL reservas.sp_rechazar_reserva(:idReserva)", nativeQuery = true)
    void rechazar(Integer idReserva);

    // ReservaRepository.java — AGREGAR
    @Query(value = "SELECT * FROM reservas.fn_datos_notificacion_reserva(:idReserva)",
            nativeQuery = true)
    Object[] obtenerDatosNotificacion(Integer idReserva);
}