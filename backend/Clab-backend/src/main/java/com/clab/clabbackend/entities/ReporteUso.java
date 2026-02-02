package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "r_reporte_uso", schema = "reportes")
public class ReporteUso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reporte_uso")
    private Integer idReporteUso;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cod_laboratorio", nullable = false)
    private Laboratorio laboratorio;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_periodo", nullable = false)
    private PeriodoAcademico periodo;

    @Column(name = "fecha_uso", nullable = false)
    private LocalDate fechaUso;

    @Column(name = "fecha_inicio_periodo", nullable = false)
    private LocalDate fechaInicioPeriodo;

    @Column(name = "fecha_fin_periodo", nullable = false)
    private LocalDate fechaFinPeriodo;

    @Column(name = "total_horas_reservadas", precision = 10, scale = 2)
    private BigDecimal totalHorasReservadas;

    @Column(name = "total_horas_utilizadas", precision = 10, scale = 2)
    private BigDecimal totalHorasUtilizadas;

    @Column(name = "total_reservas")
    private Integer totalReservas;

    @Column(name = "reservas_completadas")
    private Integer reservasCompletadas;

    @Column(name = "reservas_canceladas")
    private Integer reservasCanceladas;

    @ManyToOne(optional = false)
    @JoinColumn(name = "docente_mayor_uso", nullable = false)
    private Usuario docenteMayorUso;

    @ManyToOne(optional = false)
    @JoinColumn(name = "asignatura_mayor_uso", nullable = false)
    private Asignatura asignaturaMayorUso;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario_gen", nullable = false)
    private Usuario usuarioGenera;
}
//xd