package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.TipoBloqueo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface TipoBloqueoRepository extends JpaRepository<TipoBloqueo, Integer> {
    @Query(value = "SELECT * FROM laboratorios.fn_listar_tipos_bloqueos()", nativeQuery = true)
    List<Object[]> listarTipos();

    @Transactional
    @Modifying
    @Query(value = "CALL laboratorios.sp_insertar_tipo_bloqueo(:nombreTipo, :descripcion, :estado)", nativeQuery = true)
    void insertar(@Param("nombreTipo") String nombreTipo,
                  @Param("descripcion") String descripcion,
                  @Param("estado") String estado);

    @Transactional
    @Modifying
    @Query(value = "CALL laboratorios.sp_actualizar_tipo_bloqueo(:idTipoBloqueo, :nombreTipo, :descripcion, :estado)", nativeQuery = true)
    void actualizar(@Param("idTipoBloqueo") Integer idTipoBloqueo,
                    @Param("nombreTipo") String nombreTipo,
                    @Param("descripcion") String descripcion,
                    @Param("estado" ) String estado);

    @Transactional
    @Modifying
    @Query(value = "CALL laboratorios.sp_eliminar_tipo_bloqueo(:idTipoBloqueo)", nativeQuery = true)
    void eliminar(@Param("idTipoBloqueo") Integer idTipoBloqueo);
}
