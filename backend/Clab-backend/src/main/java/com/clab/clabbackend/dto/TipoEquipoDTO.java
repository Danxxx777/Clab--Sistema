package com.clab.clabbackend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoEquipoDTO {

    private Integer idTipoEquipo;
    private String nombre;
    private String descripcion;
}
