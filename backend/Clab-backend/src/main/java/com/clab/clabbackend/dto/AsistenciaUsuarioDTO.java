package com.clab.clabbackend.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AsistenciaUsuarioDTO {
    private Integer idReserva;
    private Integer idUsuario;
    private String observaciones;
}