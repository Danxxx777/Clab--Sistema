package com.clab.clabbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class UsuarioResponseDTO {

    private Integer idUsuario;
    private String identidad;
    private String nombres;
    private String apellidos;
    private String email;
    private String telefono;
    private String usuario;
    private String estado;
    private LocalDate fechaRegistro;
    private Integer idRol;
    private String nombreRol;

}
