package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.Auditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditoriaRepository extends JpaRepository<Auditoria, Integer> {
    List<Auditoria> findByIdUsuarioOrderByFechaHoraDesc(Integer idUsuario);
    List<Auditoria> findByModuloOrderByFechaHoraDesc(String modulo);
    List<Auditoria> findAllByOrderByFechaHoraDesc();
}