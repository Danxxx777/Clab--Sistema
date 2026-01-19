package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class C_HorarioAcademico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdHorario")
    private Integer idHorario;

    @Column(name = "DiaSemana", nullable = false, length = 15)
    private String diaSemana;

    @Column(name = "HoraInicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "HoraFin", nullable = false)
    private LocalTime horaFin;

    @Column(name = "NumeroEstudiantes")
    private Integer numeroEstudiantes;

    @Column(name = "Origen", nullable = false, length = 15)
    private String origen;

    @Column(name = "FechaImportacion")
    private LocalDate fechaImportacion;

    @Column(name = "FechaCreacion", nullable = false)
    private LocalDate fechaCreacion;

    // Muchos horarios -> un periodo
    @ManyToOne
    @JoinColumn(name = "IdPeriodo", nullable = false)
    private C_PeriodoAcademico periodo;

    // Muchos horarios -> una asignatura
    @ManyToOne
    @JoinColumn(name = "IdAsignatura", nullable = false)
    private C_Asignatura asignatura;

    // Muchos horarios -> un docente (usuario)
    @ManyToOne
    @JoinColumn(name = "IdDocente", nullable = false)
    private C_Usuario docente;

    // Un horario -> muchas reservas
    @OneToMany(mappedBy = "horarioAcademico")
    private List<C_Reserva> reservas;
}
