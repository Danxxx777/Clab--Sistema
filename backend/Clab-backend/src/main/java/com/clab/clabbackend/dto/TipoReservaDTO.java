package com.clab.clabbackend.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TipoReservaDTO {
    private Integer idTipoReserva;
    private String nombreTipo;
    private String descripcion;
    private Boolean requiereAsignatura;
}