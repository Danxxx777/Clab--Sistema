package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Reserva {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdReserva")
    private Integer idReserva;

    @Column(name = "TipoReserva", length = 50)
    private String tipoReserva;

    @Column(name = "FechaReserva", nullable = false)
    private LocalDate fechaReserva;

    @Column(name = "HoraInicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "HoraFin", nullable = false)
    private LocalTime horaFin;

    @Column(name = "Motivo", length = 200, nullable = false)
    private String motivo;

    @Column(name = "NumeroEstudiantes")
    private Integer numeroEstudiantes;

    @Column(name = "Estado", nullable = false, length = 15)
    private String estado;

    @Column(name = "Descripcion", length = 200)
    private String descripcion;

    @Column(name = "FechaSolicitud", nullable = false)
    private LocalDate fechaSolicitud;

    @Column(name = "FechaConfirmacion")
    private LocalDate fechaConfirmacion;

    @Column(name = "FechaCancelacion")
    private LocalDate fechaCancelacion;

    @Column(name = "MotivoCancelacion", length = 200)
    private String motivoCancelacion;

    // Muchas reservas -> un laboratorio
    @ManyToOne
    @JoinColumn(name = "IdLaboratorio", nullable = false)
    private Laboratorio laboratorio;

    // Muchas reservas -> usuario solicitante
    @ManyToOne
    @JoinColumn(name = "IdUsuario", nullable = false)
    private Usuario usuario;

    // Muchas reservas -> periodo
    @ManyToOne
    @JoinColumn(name = "IdPeriodo", nullable = false)
    private PeriodoAcademico periodo;

    // Muchas reservas -> horario académico
    @ManyToOne
    @JoinColumn(name = "IdHorarioAcademico", nullable = false)
    private HorarioAcademico horarioAcademico;

    // Usuario que cancela (opcional)
    @ManyToOne
    @JoinColumn(name = "IdUsuarioCancela")
    private Usuario usuarioCancela;

    @ManyToOne
    @JoinColumn(name = "IdAsignatura")
    private Asignatura asignatura;
}
