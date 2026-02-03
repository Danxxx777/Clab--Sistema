package com.clab.clabbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.antlr.v4.runtime.misc.NotNull;
import org.hibernate.annotations.NotFound;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SedeDTO {
    @NotFound
    private Integer idSede;

    @NotNull
    private String nombre;

    @NotNull
    private String direccion;

    @NotNull
    private String telefono;

    @NotNull
    private String email;

    @NotNull
    private String estado;
}
