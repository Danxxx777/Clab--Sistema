package com.clab.clabbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private String nombres;
    private String apellidos;
    private String rol;
    private Integer idUsuario;
    private List<String> rolesDisponibles;;
}
