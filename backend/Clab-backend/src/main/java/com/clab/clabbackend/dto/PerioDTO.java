package com.clab.clabbackend.dto;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.antlr.v4.runtime.misc.NotNull;
import org.hibernate.annotations.NotFound;

import java.time.LocalDate;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PerioDTO {
    @NotFound
    private Integer idPeriodo;

    @NotNull
    private String nombrePeriodo;

    @NotNull
    private LocalDate fechaInicio;

    @NotNull
    private LocalDate fechaFin;

    @NotNull
    private LocalDate fechaCreacion;

    @NotNull
    private String estado;
}
