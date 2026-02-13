package com.clab.clabbackend.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReporteFallasDTO {

    private Integer idReporte;
    private Integer codLaboratorio;
    private Integer idEquipo;
    private Integer idUsuario;
    private String descripcionFalla;
}
