package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.BackupRegistro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BackupRegistroRepository extends JpaRepository<BackupRegistro, Long> {

    List<BackupRegistro> findAllByOrderByFechaDesc();

    long countByEstado(BackupRegistro.EstadoBackup estado);

    @Query("""
        SELECT b FROM BackupRegistro b
        ORDER BY b.fecha ASC
        LIMIT :cantidad
        """)
    List<BackupRegistro> findOldestToDelete(@Param("cantidad") int cantidad);

    @Query("""
        SELECT b FROM BackupRegistro b
        WHERE b.rutaLocal IS NOT NULL
        ORDER BY b.fecha ASC
        LIMIT :cantidad
        """)
    List<BackupRegistro> findOldestWithLocalFileToDelete(@Param("cantidad") int cantidad);
}