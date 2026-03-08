package com.clab.clabbackend.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
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
    private String rol;
    private List<RolInfo> roles;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RolInfo {
        private Integer idRol;
        private String nombreRol;
    }
}