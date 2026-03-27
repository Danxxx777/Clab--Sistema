package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.FotoDTO;
import com.clab.clabbackend.repository.FotoRepository;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FotoService {
    private final FotoRepository fotoRepository;
    private final Cloudinary cloudinary;

    // ─── LISTAR ──────────────────────────────────────────────────────────────

    public List<FotoDTO> listarFotosPorLaboratorio(Integer codLaboratorio) {
        List<Object[]> resultados = fotoRepository.listarFotosPorLaboratorio(codLaboratorio);
        return resultados.stream().map(r -> {
            FotoDTO dto = new FotoDTO();
            dto.setIdFoto(((Number) r[0]).intValue());
            dto.setUrlFoto((String) r[1]);
            dto.setPublicId((String) r[2]);
            dto.setFechaSubida(r[3] != null ? ((java.sql.Date) r[3]).toLocalDate() : null);
            dto.setEstado((String) r[4]);
            return dto;
        }).collect(Collectors.toList());
    }

    // ─── SUBIR ───────────────────────────────────────────────────────────────

    @Transactional
    public void subirFotos(Integer codLaboratorio,
                           List<MultipartFile> archivos) throws IOException {
        for (MultipartFile archivo : archivos) {
            // 1. Subir a Cloudinary
            Map resultado = cloudinary.uploader().upload(
                    archivo.getBytes(),
                    ObjectUtils.asMap("folder", "laboratorios/" + codLaboratorio)
            );

            // 2. Guardar en BD via SP
            fotoRepository.insertarFoto(
                    (String) resultado.get("secure_url"),
                    (String) resultado.get("public_id"),
                    LocalDate.now(),
                    "ACTIVO",
                    codLaboratorio
            );
        }
    }

    // ─── ELIMINAR ────────────────────────────────────────────────────────────

    @Transactional
    public void eliminarFoto(Integer idFoto) throws Exception {
        // 1. Obtener public_id para eliminar de Cloudinary
        String publicId = fotoRepository.obtenerPublicId(idFoto);
        if (publicId == null) throw new RuntimeException("Foto no encontrada");

        // 2. Eliminar de Cloudinary
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());

        // 3. Eliminar de BD via SP
        fotoRepository.eliminarFoto(idFoto);
    }
}
