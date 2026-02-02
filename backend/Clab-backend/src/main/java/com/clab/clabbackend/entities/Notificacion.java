package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "n_notificacion", schema = "notificaciones")
public class Notificacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notificacion")
    private Integer idNotificacion;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "tipo_notificacion", length = 15, nullable = false)
    private String tipoNotificacion;

    @Column(name = "asunto", length = 200, nullable = false)
    private String asunto;

    @Lob
    @Column(name = "mensaje")
    private String mensaje;

    @Column(name = "canal", length = 50, nullable = false)
    private String canal;

    @Column(name = "estado", length = 15, nullable = false)
    private String estado;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDate fechaCreacion;

    @Column(name = "fecha_envio")
    private LocalDate fechaEnvio;
}

