package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.Facultad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FacultadRepository extends JpaRepository<Facultad, Integer> {

    @Query(value = "SELECT * FROM organizacion.fn_listar_facultades()", nativeQuery = true)
    List<Object[]> listarSP();

    @Query(value = "SELECT * FROM organizacion.fn_listar_decanos()", nativeQuery = true)
    List<Object[]> listarDecanosSP();

    @Transactional
    @Modifying
    @Query(value = "CALL organizacion.sp_insertar_facultad(:nombre, :descripcion, :idDecano, :estado)", nativeQuery = true)
    void insertar(String nombre, String descripcion, Integer idDecano, String estado);

    @Transactional
    @Modifying
    @Query(value = "CALL organizacion.sp_actualizar_facultad(:idFacultad, :nombre, :descripcion, :idDecano, :estado)", nativeQuery = true)
    void actualizar(Integer idFacultad, String nombre, String descripcion, Integer idDecano, String estado);
    @Transactional
    @Modifying
    @Query(value = "CALL organizacion.sp_eliminar_facultad(:idFacultad)", nativeQuery = true)
    void baja(Integer idFacultad);
}