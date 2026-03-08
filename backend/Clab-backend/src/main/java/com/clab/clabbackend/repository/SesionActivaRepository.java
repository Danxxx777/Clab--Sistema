package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.SesionActiva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SesionActivaRepository extends JpaRepository<SesionActiva, Integer> {
    Optional<SesionActiva> findByTokenHash(String tokenHash);
    List<SesionActiva> findByActivaTrueOrderByFechaInicioDesc();
    List<SesionActiva> findByIdUsuarioAndActivaTrue(Integer idUsuario);
    @Modifying
    @Transactional
    @Query("UPDATE SesionActiva s SET s.activa = false WHERE s.fechaExpira < :ahora AND s.activa = true")
    void expirarSesionesVencidas(LocalDateTime ahora);
}