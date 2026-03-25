package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
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

    @Query(value = "SELECT * FROM reservas.fn_listar_reservas_por_encargado(:idUsuario)", nativeQuery = true)
    List<Object[]> listarReservasPorEncargado(@Param("idUsuario") Integer idUsuario);

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
            ":codLaboratorio, :idUsuario, :idPeriodo, :fechaReserva, " +
            ":horaInicio, :horaFin, :motivo, :numeroEstudiantes, :descripcion, " +
            ":idHorarioAcademico, :idAsignatura, :idTipoReserva)",
            nativeQuery = true)
    void insertarAdmin(
            Integer codLaboratorio,
            Integer idUsuario,
            Integer idPeriodo,
            LocalDate fechaReserva,
            LocalTime horaInicio,
            LocalTime horaFin,
            String motivo,
            Integer numeroEstudiantes,
            String descripcion,
            Integer idHorarioAcademico,
            Integer idAsignatura,
            Integer idTipoReserva
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
    List<Object[]> obtenerDatosNotificacion(Integer idReserva);

    // CREAR RECURRENTE
    @Transactional
    @Modifying
    @Query(value = "CALL reservas.sp_crear_reserva_recurrente(" +
            ":codLaboratorio, :idUsuario, :idPeriodo, :idHorarioAcademico, " +
            ":idAsignatura, :idTipoReserva, :diasSemana, :horaInicio, " +
            ":horaFin, :motivo, :numeroEstudiantes, :descripcion)",
            nativeQuery = true)
    void crearRecurrente(
            @Param("codLaboratorio")     Integer codLaboratorio,
            @Param("idUsuario")          Integer idUsuario,
            @Param("idPeriodo")          Integer idPeriodo,
            @Param("idHorarioAcademico") Integer idHorarioAcademico,
            @Param("idAsignatura")       Integer idAsignatura,
            @Param("idTipoReserva")      Integer idTipoReserva,
            @Param("diasSemana")         String diasSemana,
            @Param("horaInicio")         LocalTime horaInicio,
            @Param("horaFin")            LocalTime horaFin,
            @Param("motivo")             String motivo,
            @Param("numeroEstudiantes")  Integer numeroEstudiantes,
            @Param("descripcion")        String descripcion
    );

    // CANCELAR GRUPO
    @Transactional
    @Modifying
    @Query(value = "CALL reservas.sp_cancelar_grupo_reserva(:idGrupo, :idUsuario, :motivo)",
            nativeQuery = true)
    void cancelarGrupo(
            @Param("idGrupo")   Integer idGrupo,
            @Param("idUsuario") Integer idUsuario,
            @Param("motivo")    String motivo
    );

    @Query(value = "SELECT * FROM reservas.fn_listar_grupos_reserva()", nativeQuery = true)
    List<Object[]> listarGruposReserva();

    // APROBAR GRUPO
    @Transactional
    @Modifying
    @Query(value = "CALL reservas.sp_aprobar_grupo_reserva(:idGrupo)", nativeQuery = true)
    void aprobarGrupo(@Param("idGrupo") Integer idGrupo);

    // RECHAZAR GRUPO
    @Transactional
    @Modifying
    @Query(value = "CALL reservas.sp_rechazar_grupo_reserva(:idGrupo)", nativeQuery = true)
    void rechazarGrupo(@Param("idGrupo") Integer idGrupo);
}