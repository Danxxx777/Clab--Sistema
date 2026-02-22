package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.Sede;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface SedeRepository extends JpaRepository<Sede, Integer> {

    // LISTAR
    @Query(value = "SELECT * FROM organizacion.fn_listar_sedes()", nativeQuery = true)
    List<Object[]> listarSedes();

    // INSERTAR
    @Transactional
    @Modifying
    @Query(value = "CALL organizacion.sp_insertar_sede(:nombre, :direccion, :telefono, :email)",
            nativeQuery = true)
    void insertar(String nombre, String direccion, String telefono, String email);

    // ACTUALIZAR
    @Transactional
    @Modifying
    @Query(value = "CALL organizacion.sp_actualizar_sede(:idSede, :nombre, :direccion, :telefono, :email)",
            nativeQuery = true)
    void actualizar(Integer idSede, String nombre, String direccion,
                    String telefono, String email);

    // ELIMINAR (BAJA LÓGICA)
    @Transactional
    @Modifying
    @Query(value = "CALL organizacion.sp_eliminar_sede(:idSede)", nativeQuery = true)
    void eliminar(Integer idSede);
}