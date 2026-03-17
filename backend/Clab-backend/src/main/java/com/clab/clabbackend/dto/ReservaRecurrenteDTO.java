package com.clab.clabbackend.dto;

import lombok.*;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReservaRecurrenteDTO {
    private Integer codLaboratorio;
    private Integer idUsuario;
    private Integer idPeriodo;
    private Integer idHorarioAcademico;
    private Integer idAsignatura;
    private Integer idTipoReserva;
    private String  diasSemana;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private String  motivo;
    private Integer numeroEstudiantes;
    private String  descripcion;
}