package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Auditoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdAuditoria")
    private Integer idAuditoria;

    @Column(name = "TablaAfectada", length = 50, nullable = false)
    private String tablaAfectada;

    @Column(name = "id_registro_afectado", nullable = false)
    private Integer idRegistroAfectado;

    @Column(name = "Accion", length = 15, nullable = false)
    private String accion;

    @Column(name = "Descripcion", length = 200)
    private String descripcion;

    @Column(name = "FechaHora", nullable = false)
    private LocalDateTime fechaHora;

    // Muchas auditorías -> un usuario
    @ManyToOne
    @JoinColumn(name = "IdUsuario", nullable = false)
    private Usuario usuario;
}
