package com.clab.clabbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DecanoResponseDTO {
    private Integer idUsuario;
    private String nombreDecano;
}