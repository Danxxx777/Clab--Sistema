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
@Table(name = "r_reporte_falla", schema = "reportes")
public class ReporteFallas {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reporte")
    private Integer idReporte;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_equipo", nullable = false)
    private Equipo equipo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cod_laboratorio", nullable = false)
    private Laboratorio laboratorio;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "descripcion_falla", length = 200, nullable = false)
    private String descripcionFalla;

    @Column(name = "estado", length = 15, nullable = false)
    private String estado;

    @Column(name = "fecha_reporte", nullable = false)
    private LocalDate fechaReporte;

    @Column(name = "fecha_asignacion")
    private LocalDate fechaAsignacion;

    @Column(name = "fecha_inicio_resolucion")
    private LocalDate fechaInicioResolucion;

    @Column(name = "fecha_resolucion")
    private LocalDate fechaResolucion;

    @Column(name = "solucion_aplicada", length = 200)
    private String solucionAplicada;

    @Column(name = "requiere_seguimiento", nullable = false)
    private Boolean requiereSeguimiento;
}
//xd