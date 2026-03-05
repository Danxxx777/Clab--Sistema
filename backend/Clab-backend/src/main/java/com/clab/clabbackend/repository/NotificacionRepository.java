package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.Notificacion;
import com.clab.clabbackend.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Integer> {

    List<Notificacion> findByUsuarioOrderByFechaCreacionDesc(Usuario usuario);

    List<Notificacion> findByUsuarioAndEstadoOrderByFechaCreacionDesc(Usuario usuario, String estado);



    long countByUsuarioAndEstado(Usuario usuario, String estado);

    @Query("SELECT n FROM Notificacion n WHERE n.usuario = :usuario " +
            "AND (:rol = 'Administradorr' OR n.rolDestino = :rol OR n.rolDestino IS NULL) " +
            "ORDER BY n.fechaCreacion DESC")
    List<Notificacion> findByUsuarioAndRol(
            @Param("usuario") Usuario usuario,
            @Param("rol") String rol
    );
}