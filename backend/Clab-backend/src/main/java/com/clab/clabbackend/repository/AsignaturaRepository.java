package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.Asignatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface AsignaturaRepository extends JpaRepository<Asignatura, Integer> {

    @Query(value = "SELECT * FROM academico.fn_listar_asignaturas()", nativeQuery = true)
    List<Object[]> listarSP();

    @Transactional
    @Modifying
    @Query(value = "CALL academico.sp_insertar_asignatura(:nombre, :idCarrera, :nivel, :horasSemanales, :requiereLaboratorio)", nativeQuery = true)
    void insertar(String nombre, Integer idCarrera, Integer nivel, Integer horasSemanales, Boolean requiereLaboratorio);

    @Transactional
    @Modifying
    @Query(value = "CALL academico.sp_actualizar_asignatura(:idAsignatura, :nombre, :idCarrera, :nivel, :horasSemanales, :requiereLaboratorio, :estado)", nativeQuery = true)
    void actualizar(Integer idAsignatura, String nombre, Integer idCarrera, Integer nivel, Integer horasSemanales, Boolean requiereLaboratorio, String estado);

    @Transactional
    @Modifying
    @Query(value = "CALL academico.sp_eliminar_asignatura(:idAsignatura)", nativeQuery = true)
    void baja(Integer idAsignatura);
}