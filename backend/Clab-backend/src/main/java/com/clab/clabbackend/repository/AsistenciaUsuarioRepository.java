package com.clab.clabbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.clab.clabbackend.entities.AsistenciaUsuario;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface AsistenciaUsuarioRepository extends JpaRepository<AsistenciaUsuario, Integer> {

    @Query(value = "SELECT * FROM reservas.fn_listar_reservas_hoy()", nativeQuery = true)
    List<Object[]> listarReservasHoy();

    @Modifying
    @Transactional
    @Query(value = "CALL reservas.sp_registrar_asistencia(:idReserva, :idUsuario, CAST(:horaApertura AS TIME), :observaciones)", nativeQuery = true)
    void registrarAsistencia(@Param("idReserva") Integer idReserva,
                             @Param("idUsuario") Integer idUsuario,
                             @Param("horaApertura") String horaApertura,
                             @Param("observaciones") String observaciones);

    @Modifying
    @Transactional
    @Query(value = "CALL reservas.sp_verificar_bloqueo_usuario(:idUsuario)", nativeQuery = true)
    void verificarBloqueo(@Param("idUsuario") Integer idUsuario);

    @Query(value = "SELECT reservas.fn_usuario_bloqueado(:idUsuario)", nativeQuery = true)
    Boolean usuarioBloqueado(@Param("idUsuario") Integer idUsuario);

    @Modifying
    @Transactional
    @Query(value = "CALL reservas.sp_registrar_falta(:idReserva, :idUsuario)", nativeQuery = true)
    void registrarFalta(@Param("idReserva") Integer idReserva,
                        @Param("idUsuario") Integer idUsuario);
}