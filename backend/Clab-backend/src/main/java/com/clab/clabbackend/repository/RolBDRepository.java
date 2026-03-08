package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.RolBD;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

public interface RolBDRepository extends JpaRepository<RolBD, Integer> {
    Optional<RolBD> findByNombreRolBd(String nombreRolBd);
    @Transactional
    @Modifying
    @Query(value = """
    CALL usuarios.sp_rol_bd_permisos_asignar(
        :idRolBd, :nombreRolBd, :esquema,
        :sel, :ins, :upd, :del
    )
    """, nativeQuery = true)
    void spAsignarPermisos(
            @Param("idRolBd")     Integer idRolBd,
            @Param("nombreRolBd") String  nombreRolBd,
            @Param("esquema")     String  esquema,
            @Param("sel")         boolean sel,
            @Param("ins")         boolean ins,
            @Param("upd")         boolean upd,
            @Param("del")         boolean del
    );
}
