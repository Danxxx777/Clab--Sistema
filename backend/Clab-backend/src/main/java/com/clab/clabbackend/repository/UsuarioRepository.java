package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByUsuario(String usuario);
    Optional<Usuario> findByUsuarioAndEstado(String usuario, String estado);
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByTokenRecuperacion(String token);

    @Modifying
    @Query(value = """ 
            CALL usuarios.sp_usuario_insertar(:p_identidad,:p_nombres,:p_apellidos,:p_email,:p_telefono,:p_usuario_bd,:p_password_sistema,:p_password_bd,:p_id_rol)""", nativeQuery = true) void spUsuarioInsertar(
            @Param("p_identidad") String identidad,
            @Param("p_nombres") String nombres,
            @Param("p_apellidos") String apellidos,
            @Param("p_email") String email,
            @Param("p_telefono") String telefono,
            @Param("p_usuario_bd") String usuarioBd,
            @Param("p_password_sistema") String passwordSistema,
            @Param("p_password_bd") String passwordBd,
            @Param("p_id_rol") Integer idRol
    );
}
