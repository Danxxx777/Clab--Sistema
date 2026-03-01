package com.clab.clabbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HorarioDTO {
    private Integer idPeriodo;
    private Integer idAsignatura;
    private Integer idDocente;
    private String diaSemana;
    private String horaInicio;
    private String horaFin;
    private Integer numeroEstudiantes;
    private String estado;
}