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
@Table(name = "r_grupo_reserva", schema = "reservas")
public class GrupoReserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_grupo")
    private Integer idGrupo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cod_laboratorio", nullable = false)
    private Laboratorio laboratorio;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_periodo", nullable = false)
    private PeriodoAcademico periodo;

    @ManyToOne
    @JoinColumn(name = "id_asignatura")
    private Asignatura asignatura;

    @ManyToOne
    @JoinColumn(name = "id_tipo_reserva")
    private TipoReserva tipoReserva;

    @ManyToOne
    @JoinColumn(name = "id_horario_academico")
    private HorarioAcademico horarioAcademico;

    @Column(name = "dias_semana", nullable = false)
    private String diasSemana;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Column(name = "motivo", length = 200)
    private String motivo;

    @Column(name = "numero_estudiantes")
    private Integer numeroEstudiantes;

    @Column(name = "descripcion", length = 200)
    private String descripcion;

    @Column(name = "estado", length = 15)
    private String estado;

    @Column(name = "fecha_creacion")
    private LocalDate fechaCreacion;
}