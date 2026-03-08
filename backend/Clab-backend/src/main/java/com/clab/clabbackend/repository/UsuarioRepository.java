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
    CALL usuarios.sp_usuario_insertar(
        :identidad, :nombres, :apellidos, :email, :telefono,
        :usuario, :passwordSistema, :passwordBd, :estado, :idRol
    )
    """, nativeQuery = true)
    void spUsuarioInsertar(
            @Param("identidad")       String  identidad,
            @Param("nombres")         String  nombres,
            @Param("apellidos")       String  apellidos,
            @Param("email")           String  email,
            @Param("telefono")        String  telefono,
            @Param("usuario")         String  usuario,
            @Param("passwordSistema") String  passwordSistema,
            @Param("passwordBd")      String  passwordBd,
            @Param("estado")          String  estado,
            @Param("idRol")           Integer idRol
    );
}
