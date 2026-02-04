package com.clab.clabbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LaboratorioDTO {

    private Integer codLaboratorio;
    private String nombreLab;
    private String ubicacion;
    private Integer capacidadEstudiantes;
    private Integer numeroEquipos;
    private String descripcion;
    private String estadoLab;
    private Integer idSede;

    private String nombreSede;
    private String encargadoNombre;
    private String foto;
}