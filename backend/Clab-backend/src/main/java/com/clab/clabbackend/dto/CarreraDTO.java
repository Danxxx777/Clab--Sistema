package com.clab.clabbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CarreraDTO {
    private String nombre;
    private Integer idFacultad;
    private Integer idCoordinador;
    private String estado;
}