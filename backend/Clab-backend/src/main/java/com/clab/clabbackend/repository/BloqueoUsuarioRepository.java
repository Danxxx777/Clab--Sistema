package com.clab.clabbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import com.clab.clabbackend.entities.BloqueoUsuario;
import java.util.List;

@Repository
public interface BloqueoUsuarioRepository extends JpaRepository<BloqueoUsuario, Integer> {

    @Query(value = "SELECT * FROM reservas.fn_listar_bloqueados()", nativeQuery = true)
    List<Object[]> listarBloqueados();

    @Modifying
    @Transactional
    @Query(value = "CALL reservas.sp_desbloquear_usuario(:idUsuario)", nativeQuery = true)
    void desbloquearUsuario(@Param("idUsuario") Integer idUsuario);
}