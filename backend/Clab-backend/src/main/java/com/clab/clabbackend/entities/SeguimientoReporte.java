package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class SeguimientoReporte {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdSeguimiento")
    private Integer idSeguimiento;

    @Column(name = "EstadoAnterior", length = 50)
    private String estadoAnterior;

    @Column(name = "EstadoNuevo", length = 50)
    private String estadoNuevo;

    @Column(name = "Motivo", length = 100)
    private String motivo;

    @Column(name = "AccionEealizada", length = 100)
    private String accionRealizada;

    @Column(name = "FechaSeguimiento", nullable = false)
    private LocalDate fechaSeguimiento;

    // Muchos seguimientos -> un reporte
    @ManyToOne
    @JoinColumn(name = "IdReporte", nullable = false)
    private ReporteFallas reporte;

    // Usuario que realiza la acción
    @ManyToOne
    @JoinColumn(name = "IdUsuario", nullable = false)
    private Usuario usuario;
}
