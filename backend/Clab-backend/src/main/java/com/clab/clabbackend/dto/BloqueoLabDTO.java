package com.clab.clabbackend.dto;

import lombok.Data;

@Data
public class BloqueoLabDTO {
    private Integer codLaboratorio;
    private Integer idTipoBloqueo;
    private String motivo;
    private String fechaInicio;
    private String fechaFin;
    private String estado;
}