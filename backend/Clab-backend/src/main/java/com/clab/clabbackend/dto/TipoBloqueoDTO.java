package com.clab.clabbackend.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TipoBloqueoDTO {
    private Integer idTipoBloqueo;
    private String nombreTipo;
    private String descripcion;
    private String estado;
}
