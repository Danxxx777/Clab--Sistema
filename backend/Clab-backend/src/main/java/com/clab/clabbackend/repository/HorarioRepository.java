package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.HorarioAcademico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface HorarioRepository extends JpaRepository<HorarioAcademico, Integer> {

    @Query(value = "SELECT * FROM academico.fn_listar_horarios()", nativeQuery = true)
    List<Object[]> listarSP();

    @Query(value = "SELECT * FROM academico.fn_listar_docentes()", nativeQuery = true)
    List<Object[]> listarDocentesSP();

    @Transactional
    @Modifying
    @Query(value = "CALL academico.sp_insertar_horario(:idPeriodo, :idAsignatura, :idDocente, :diaSemana, CAST(:horaInicio AS TIME), CAST(:horaFin AS TIME), :numeroEstudiantes)", nativeQuery = true)
    void insertar(Integer idPeriodo, Integer idAsignatura, Integer idDocente, String diaSemana, String horaInicio, String horaFin, Integer numeroEstudiantes);

    @Transactional
    @Modifying
    @Query(value = "CALL academico.sp_actualizar_horario(:idHorario, :idPeriodo, :idAsignatura, :idDocente, :diaSemana, CAST(:horaInicio AS TIME), CAST(:horaFin AS TIME), :numeroEstudiantes, :estado)", nativeQuery = true)
    void actualizar(Integer idHorario, Integer idPeriodo, Integer idAsignatura, Integer idDocente, String diaSemana, String horaInicio, String horaFin, Integer numeroEstudiantes, String estado);

    @Transactional
    @Modifying
    @Query(value = "CALL academico.sp_eliminar_horario(:idHorario)", nativeQuery = true)
    void baja(Integer idHorario);
}