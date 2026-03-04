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

    @Column(name = "id_registro_afectado")
    private Integer idRegistroAfectado;

    @Column(name = "id_usuario")
    private Integer idUsuario;

    @Column(name = "usuario", length = 100)
    private String usuario;

    @Column(name = "fecha_hora")
    private LocalDateTime fechaHora;

    @Column(name = "accion", length = 255)
    private String accion;

    @Column(name = "tabla_afectada", length = 255)
    private String tablaAfectada;

    @Column(name = "modulo", length = 100)
    private String modulo;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "ip", length = 50)
    private String ip;

    @Column(name = "resultado", length = 20)
    private String resultado;
}