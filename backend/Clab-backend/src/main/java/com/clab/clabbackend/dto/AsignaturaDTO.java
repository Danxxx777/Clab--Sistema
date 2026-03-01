package com.clab.clabbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AsignaturaDTO {
    private String nombre;
    private Integer idCarrera;
    private Integer nivel;
    private Integer horasSemanales;
    private Boolean requiereLaboratorio;
    private String estado;
}