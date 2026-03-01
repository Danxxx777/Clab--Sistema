package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.Carrera;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface CarreraRepository extends JpaRepository<Carrera, Integer> {

    @Query(value = "SELECT * FROM academico.fn_listar_carreras()", nativeQuery = true)
    List<Object[]> listarSP();

    @Query(value = "SELECT * FROM academico.fn_listar_coordinadores()", nativeQuery = true)
    List<Object[]> listarCoordinadoresSP();

    @Transactional
    @Modifying
    @Query(value = "CALL academico.sp_insertar_carrera(:nombre, :idFacultad, :idCoordinador)", nativeQuery = true)
    void insertar(String nombre, Integer idFacultad, Integer idCoordinador);

    @Transactional
    @Modifying
    @Query(value = "CALL academico.sp_actualizar_carrera(:idCarrera, :nombre, :idFacultad, :idCoordinador, :estado)", nativeQuery = true)
    void actualizar(Integer idCarrera, String nombre, Integer idFacultad, Integer idCoordinador, String estado);

    @Transactional
    @Modifying
    @Query(value = "CALL academico.sp_eliminar_carrera(:idCarrera)", nativeQuery = true)
    void baja(Integer idCarrera);
}