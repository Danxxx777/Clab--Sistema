package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class C_ReporteFallas {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdReporte")
    private Integer idReporte;

    @Column(name = "DescripcionFalla", length = 200, nullable = false)
    private String descripcionFalla;

    @Column(name = "Estado", nullable = false, length = 15)
    private String estado;

    @Column(name = "RechaReporte", nullable = false)
    private LocalDate fechaReporte;

    @Column(name = "FechaAsignacion")
    private LocalDate fechaAsignacion;

    @Column(name = "FechaInicioResolucion")
    private LocalDate fechaInicioResolucion;

    @Column(name = "FechaResolucion")
    private LocalDate fechaResolucion;

    @Column(name = "SolucionAplicada", length = 200)
    private String solucionAplicada;

    @Column(name = "RequiereSeguimiento", nullable = false)
    private Boolean requiereSeguimiento;

    // Muchos reportes -> un equipo
    @ManyToOne
    @JoinColumn(name = "IdEquipo", nullable = false)
    private C_Equipo equipo;

    // Muchos reportes -> un laboratorio
    @ManyToOne
    @JoinColumn(name = "IdLaboratorio", nullable = false)
    private C_Laboratorio laboratorio;

    // Usuario que reporta la falla
    @ManyToOne
    @JoinColumn(name = "IdUsuario", nullable = false)
    private C_Usuario usuario;

    // Seguimientos del reporte
    @OneToMany(mappedBy = "reporte")
    private List<C_SeguimientoReporte> seguimientos;
}
