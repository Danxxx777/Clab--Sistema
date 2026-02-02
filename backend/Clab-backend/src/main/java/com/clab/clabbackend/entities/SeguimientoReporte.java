package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "i_seguimiento_reporte", schema = "inventario")
public class SeguimientoReporte {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_seguimiento")
    private Integer idSeguimiento;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_reporte", nullable = false)
    private ReporteFallas reporte;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "estado_anterior", length = 50)
    private String estadoAnterior;

    @Column(name = "estado_nuevo", length = 50)
    private String estadoNuevo;

    @Column(name = "motivo", length = 100)
    private String motivo;

    @Column(name = "accion_realizada", length = 100)
    private String accionRealizada;

    @Column(name = "fecha_seguimiento", nullable = false)
    private LocalDate fechaSeguimiento;
}
