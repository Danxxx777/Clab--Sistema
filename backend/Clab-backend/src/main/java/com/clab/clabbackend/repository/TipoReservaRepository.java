package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.TipoReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface TipoReservaRepository extends JpaRepository<TipoReserva, Integer> {

    // LISTAR
    @Query(value = "SELECT * FROM reservas.fn_listar_tipos_reserva()", nativeQuery = true)
    List<Object[]> listarTipos();

    @Transactional
    @Modifying
    @Query(value = "CALL reservas.sp_insertar_tipo_reserva(:nombreTipo, :descripcion, CAST(:requiereAsignatura AS boolean))",
            nativeQuery = true)
    void insertar(@Param("nombreTipo") String nombreTipo,
                  @Param("descripcion") String descripcion,
                  @Param("requiereAsignatura") Boolean requiereAsignatura);

    @Transactional
    @Modifying
    @Query(value = "SELECT reservas.sp_actualizar_tipo_reserva(:idTipoReserva, :nombreTipo, :descripcion, :requiereAsignatura::boolean)",
            nativeQuery = true)
    void actualizar(Integer idTipoReserva, String nombreTipo, String descripcion, Boolean requiereAsignatura);

    // ELIMINAR (BAJA LÓGICA)
    @Transactional
    @Modifying
    @Query(value = "CALL reservas.sp_eliminar_tipo_reserva(:idTipoReserva)", nativeQuery = true)
    void eliminar(Integer idTipoReserva);
}