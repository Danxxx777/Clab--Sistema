package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class C_ReporteUso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdReporteUso")
    private Integer idReporteUso;

    @Column(name = "FechaUso", nullable = false)
    private LocalDate fechaUso;

    @Column(name = "FechaInicioPeriodo", nullable = false)
    private LocalDate fechaInicioPeriodo;

    @Column(name = "FechaFinPeriodo", nullable = false)
    private LocalDate fechaFinPeriodo;

    @Column(name = "TotalHorasReservadas", columnDefinition = "decimal(10,2)")
    private Double totalHorasReservadas;

    @Column(name = "TotalHorasUtilizadas", columnDefinition = "decimal(10,2)")
    private Double totalHorasUtilizadas;

    @Column(name = "TotalReservas")
    private Integer totalReservas;

    @Column(name = "ReservasCompletadas")
    private Integer reservasCompletadas;

    @Column(name = "ReservasCanceladas")
    private Integer reservasCanceladas;

    // Reporte por laboratorio
    @ManyToOne
    @JoinColumn(name = "IdLaboratorio", nullable = false)
    private C_Laboratorio laboratorio;

    // Reporte por periodo
    @ManyToOne
    @JoinColumn(name = "IdPeriodo", nullable = false)
    private C_PeriodoAcademico periodo;

    // Docente con mayor uso
    @ManyToOne
    @JoinColumn(name = "DocenteMayorso", nullable = false)
    private C_Usuario docenteMayorUso;

    // Asignatura con mayor uso
    @ManyToOne
    @JoinColumn(name = "AsignaturaMayorUso", nullable = false)
    private C_Asignatura asignaturaMayorUso;

    // Usuario que genera el reporte
    @ManyToOne
    @JoinColumn(name = "IdUsuarioGen", nullable = false)
    private C_Usuario usuarioGenera;
}
