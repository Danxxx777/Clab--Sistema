package com.clab.clabbackend.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CancelacionDTO {
    private Integer idReserva;
    private Integer idUsuarioCancela;
    private String motivoCancelacion;
}