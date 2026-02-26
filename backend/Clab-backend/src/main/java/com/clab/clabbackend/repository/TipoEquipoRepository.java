package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.TipoEquipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface TipoEquipoRepository extends JpaRepository<TipoEquipo, Integer> {
    // INSERTAR
    @Transactional
    @Modifying
    @Query(value = "CALL inventario.sp_insertar_tipo_equipo(:nombre, :descripcion)", nativeQuery = true)
    void insertar(String nombre, String descripcion);

    // ACTUALIZAR
    @Transactional
    @Modifying
    @Query(value = "CALL inventario.sp_actualizar_tipo_equipo(:id, :nombre, :descripcion)", nativeQuery = true)
    void actualizarSP(Integer id, String nombre, String descripcion);

    // BAJA LOGICA
    @Transactional
    @Modifying
    @Query(value = "CALL inventario.sp_baja_tipo_equipo(:id)", nativeQuery = true)
    void baja(Integer id);

    // LISTAR ACTIVOS
    @Query(value = "SELECT * FROM inventario.fn_listar_tipo_equipo()", nativeQuery = true)
    List<TipoEquipo> listarActivos();
}
