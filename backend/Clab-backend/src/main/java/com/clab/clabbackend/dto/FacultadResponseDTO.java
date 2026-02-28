package com.clab.clabbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class FacultadResponseDTO {
    private Integer idFacultad;
    private String nombre;
    private String descripcion;
    private String estado;
    private Integer idDecano;
    private String nombreDecano;
    private LocalDate fechaCreacion;
}