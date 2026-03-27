package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.Foto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

public interface FotoRepository extends JpaRepository<Foto, Integer> {
    @Query(value = "SELECT * FROM recursos.fn_listar_fotos_laboratorio(:codLaboratorio)",
            nativeQuery = true)
    List<Object[]> listarFotosPorLaboratorio(
            @Param("codLaboratorio") Integer codLaboratorio
    );

    @Query(value = "SELECT recursos.fn_obtener_public_id(:idFoto)",
            nativeQuery = true)
    String obtenerPublicId(@Param("idFoto") Integer idFoto);

    @Transactional
    @Modifying
    @Query(value = "CALL recursos.sp_insertar_foto(:urlFoto, :publicId, :fechaSubida, :estado, :codLaboratorio)",
            nativeQuery = true)
    void insertarFoto(
            @Param("urlFoto")         String urlFoto,
            @Param("publicId")        String publicId,
            @Param("fechaSubida") LocalDate fechaSubida,
            @Param("estado")          String estado,
            @Param("codLaboratorio")  Integer codLaboratorio
    );

    @Transactional
    @Modifying
    @Query(value = "CALL recursos.sp_eliminar_foto(:idFoto)",
            nativeQuery = true)
    void eliminarFoto(@Param("idFoto") Integer idFoto);
}
