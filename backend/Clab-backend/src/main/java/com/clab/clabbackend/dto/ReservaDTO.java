package com.clab.clabbackend.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReservaDTO {
    private Integer idReserva;
    private Integer codLaboratorio;
    private Integer idUsuario;
    private Integer idPeriodo;
    private Integer idHorarioAcademico;
    private Integer idAsignatura;
    private Integer idTipoReserva;
    private LocalDate fechaReserva;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private String motivo;
    private Integer numeroEstudiantes;
    private String descripcion;
}