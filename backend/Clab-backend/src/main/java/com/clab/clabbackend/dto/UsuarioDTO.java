package com.clab.clabbackend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {

    private String identidad;
    private String nombres;
    private String apellidos;
    private String email;
    private String telefono;
    private String contrasenia;
    private Integer idRol;
}
