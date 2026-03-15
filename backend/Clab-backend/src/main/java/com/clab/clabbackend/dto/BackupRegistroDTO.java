package com.clab.clabbackend.dto;

import com.clab.clabbackend.entities.BackupRegistro;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackupRegistroDTO {

    private Long id;
    private LocalDateTime fecha;
    private String tipo;
    private String estado;
    private String tamano;
    private String rutaLocal;
    private String rutaDrive;
    private String error;
    private String modalidad;
    private Integer tablasIncluidas;

    // Método de conversión
    public static BackupRegistroDTO fromEntity(BackupRegistro entity) {
        return BackupRegistroDTO.builder()
                .id(entity.getId())
                .fecha(entity.getFecha())
                .tipo(entity.getTipo().name())
                .estado(entity.getEstado().name())
                .tamano(entity.getTamano())
                // Solo indicamos si existe ruta local (no la exponemos completa)
                .rutaLocal(entity.getRutaLocal() != null ? "exists" : null)
                .rutaDrive(entity.getRutaDrive())
                .error(entity.getError())
                .modalidad(entity.getModalidad() != null ? entity.getModalidad().name() : "COMPLETO")
                .tablasIncluidas(entity.getTablasIncluidas())
                .build();
    }
}