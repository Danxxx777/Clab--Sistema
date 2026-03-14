package com.clab.clabbackend.dto.reporte;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ResumenGlobalDTO {
    private long reservas;
    private long asistencias;
    private long fallas;
    private long usuarios;
    private long equipos;
    private long bloqueos;
}
