package com.clab.clabbackend.repository.usuarios;

import com.clab.clabbackend.entities.usuarios.SolicitudAcceso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SolicitudAccesoRepository extends JpaRepository<SolicitudAcceso, Integer> {
    List<SolicitudAcceso> findByEstadoOrderByFechaSolicitudDesc(String estado);
    long countByEstado(String estado);
}