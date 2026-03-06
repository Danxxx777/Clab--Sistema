package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.BloqueoLab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface BloqueoLabRepository extends JpaRepository<BloqueoLab, Integer> {

    @Transactional
    @Modifying
    @Query(value = "CALL laboratorios.sp_insertar_bloqueo(:codLaboratorio, :idUsuario, :idTipoBloqueo, :motivo, CAST(:fechaInicio AS DATE), CAST(:fechaFin AS DATE), :estado)", nativeQuery = true)
    void insertar(Integer codLaboratorio, Integer idUsuario, Integer idTipoBloqueo, String motivo, String fechaInicio, String fechaFin, String estado);

    @Transactional
    @Modifying
    @Query(value = "CALL laboratorios.sp_actualizar_bloqueo(:idBloqueo, :codLaboratorio, :idTipoBloqueo, :motivo, CAST(:fechaInicio AS DATE), CAST(:fechaFin AS DATE), :estado)", nativeQuery = true)
    void actualizar(Integer idBloqueo, Integer codLaboratorio, Integer idTipoBloqueo, String motivo, String fechaInicio, String fechaFin, String estado);

    @Transactional
    @Modifying
    @Query(value = "CALL laboratorios.sp_eliminar_bloqueo(:idBloqueo)", nativeQuery = true)
    void eliminar(Integer idBloqueo);

    @Query(value = "SELECT * FROM laboratorios.fn_listar_bloqueos()", nativeQuery = true)
    List<Object[]> listar();
}