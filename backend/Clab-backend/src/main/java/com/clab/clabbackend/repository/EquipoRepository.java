package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.Equipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Modifying;

import java.time.LocalDate;
import java.util.List;


@Repository
public interface EquipoRepository extends JpaRepository<Equipo, Integer> {

    @Query(value = "SELECT * FROM inventario.fn_listar_equipos()", nativeQuery = true)
    List<Object[]> listarSP();

    @Transactional
    @Modifying
    @Query(value = "CALL inventario.sp_insertar_equipo(:numeroSerie, :nombreEquipo, :marca, :modelo, :idTipoEquipo, :estado, :codLaboratorio, :ubicacionFisica, :fechaAdquisicion)", nativeQuery = true)
    void insertar(
            String numeroSerie,
            String nombreEquipo,
            String marca,
            String modelo,
            Integer idTipoEquipo,
            String estado,
            Integer codLaboratorio,
            String ubicacionFisica,
            LocalDate fechaAdquisicion
    );

    @Transactional
    @Modifying
    @Query(value = "CALL inventario.sp_actualizar_equipo(:idEquipo, :numeroSerie, :nombreEquipo, :marca, :modelo, :idTipoEquipo, :estado, :codLaboratorio, :ubicacionFisica, :fechaAdquisicion)", nativeQuery = true)
    void actualizar(
            Integer idEquipo,
            String numeroSerie,
            String nombreEquipo,
            String marca,
            String modelo,
            Integer idTipoEquipo,
            String estado,
            Integer codLaboratorio,
            String ubicacionFisica,
            LocalDate fechaAdquisicion
    );

    @Transactional
    @Modifying
    @Query(value = "CALL inventario.sp_baja_equipo(:idEquipo)", nativeQuery = true)
    void baja(Integer idEquipo);
}

