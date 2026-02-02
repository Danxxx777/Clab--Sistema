package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "u_auditoria", schema = "usuarios")
public class Auditoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_auditoria")
    private Integer idAuditoria;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "tabla_afectada", length = 50, nullable = false)
    private String tablaAfectada;

    @Column(name = "id_registro_afectado", nullable = false)
    private Integer idRegistroAfectado;

    @Column(name = "accion", length = 15, nullable = false)
    private String accion;

    @Column(name = "descripcion", length = 200)
    private String descripcion;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;
}
//xd