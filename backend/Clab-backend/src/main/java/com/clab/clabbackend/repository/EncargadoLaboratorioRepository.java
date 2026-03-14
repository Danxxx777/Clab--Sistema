package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.EncargadoLaboratorio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

public interface EncargadoLaboratorioRepository extends JpaRepository<EncargadoLaboratorio, Integer> {
    // Listar todos
    @Query(value = "SELECT * FROM laboratorios.fn_listar_encargados()", nativeQuery = true)
    List<Object[]> listarEncargados();

    @Query(value = "SELECT * FROM laboratorios.fn_listar_rol_encargado()", nativeQuery = true)
    List<Object[]> listarRolEncargados();

    @Query(value = "SELECT * FROM laboratorios.fn_listar_laboratorios()", nativeQuery = true)
    List<Object[]> listarLaboratorios();

    // Insertar
    @Transactional
    @Modifying
    @Query(value = "CALL laboratorios.sp_insertar_encargado(:codLab, :fecha, :idUsuario, :vigente)", nativeQuery = true)
    void insertarEncargado(
            @Param("codLab") Integer codLaboratorio,
            @Param("fecha") LocalDate fechaAsignacion,
            @Param("idUsuario") Integer idUsuario,
            @Param("vigente") Boolean vigente
    );

    // Actualizar
    @Transactional
    @Modifying
    @Query(value = "CALL laboratorios.sp_actualizar_encargado(:codLab, :fecha, :idEncargado, :idUsuario, :vigente)", nativeQuery = true)
    void actualizarEncargado(
            @Param("idEncargado") Integer idEncargadoLaboratorio,
            @Param("codLab") Integer codLaboratorio,
            @Param("fecha") LocalDate fechaAsignacion,
            @Param("idUsuario") Integer idUsuario,
            @Param("vigente") Boolean vigente
    );

    // Eliminar
    @Transactional
    @Modifying
    @Query(value = "CALL laboratorios.sp_eliminar_encargado(:idEncargado)", nativeQuery = true)
    void eliminarEncargado(@Param("idEncargado") Integer idEncargadoLaboratorio);

}
