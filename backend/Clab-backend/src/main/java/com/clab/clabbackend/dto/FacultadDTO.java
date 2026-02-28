package com.clab.clabbackend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class FacultadDTO {
    private String nombre;
    private String descripcion;
    private Integer idDecano;
    private String estado;

}