package com.clab.clabbackend.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data

public class UsuarioDTO {
    private String identidad;
    private String nombres;
    private String apellidos;
    private String email;
    private String telefono;
    private String contrasenia;
}
