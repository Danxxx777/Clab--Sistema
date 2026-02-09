package com.clab.clabbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.antlr.v4.runtime.misc.NotNull;

import java.time.LocalDate;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RolDTO {

    private Integer idRol;

    @NotNull
    private String nombreRol;

    private String descripcion;


    private LocalDate fechaCreacion;
}
