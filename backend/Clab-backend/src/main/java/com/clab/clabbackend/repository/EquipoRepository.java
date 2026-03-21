package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.Equipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;


@Repository
public interface EquipoRepository extends JpaRepository<Equipo, Integer> {

    @Query(value = "SELECT * FROM inventario.fn_listar_equipos()", nativeQuery = true)
    List<Object[]> listarSP();

    @Query(value = "SELECT * FROM inventario.fn_equipos_por_encargado(:idUsuario)", nativeQuery = true)
    List<Object[]> equiposPorEncargado(@Param("idUsuario") Integer idUsuario);

    @Query(value = "SELECT * FROM inventario.fn_equipos_por_laboratorio(:codLaboratorio)",
            nativeQuery = true)
    List<Object[]> equiposPorLaboratorio(Integer codLaboratorio);

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

    @Query(value = "SELECT * FROM inventario.fn_reporte_equipos(:codLaboratorio, :estado)", nativeQuery = true)
    List<Object[]> reporteEquipos(
            @Param("codLaboratorio") Integer codLaboratorio,
            @Param("estado")         String estado
    );
}

