package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.ReporteFallas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReporteFallasRepository extends JpaRepository<ReporteFallas, Integer> {

    // LISTAR
    @Query(value = "SELECT * FROM reportes.fn_listar_reportes()", nativeQuery = true)
    List<Object[]> listarReportes();

    // INSERTAR
    @Transactional
    @Modifying
    @Query(value = "CALL reportes.sp_insertar_reporte(:codLaboratorio, :idEquipo, :idUsuario, :descripcionFalla)",
            nativeQuery = true)
    void insertar(Integer codLaboratorio, Integer idEquipo,
                  Integer idUsuario, String descripcionFalla);

    // ELIMINAR
    @Transactional
    @Modifying
    @Query(value = "CALL reportes.sp_eliminar_reporte(:idReporte)", nativeQuery = true)
    void eliminar(Integer idReporte);
}