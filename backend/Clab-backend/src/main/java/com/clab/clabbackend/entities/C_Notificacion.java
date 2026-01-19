package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class C_Notificacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdNotificacion")
    private Integer idNotificacion;

    @Column(name = "TipoNotificacion", nullable = false,  length = 50)
    private String tipoNotificacion;

    @Column(name = "Asunto", length = 200, nullable = false)
    private String asunto;

    @Column(name = "Mensaje", length = 100)
    private String mensaje;

    @Column(name = "Canal", length = 50, nullable = false)
    private String canal;

    @Column(nullable = false,  length = 15, name = "Estado")
    private String estado;

    @Column(name = "FechaCreacion", nullable = false)
    private LocalDate fechaCreacion;

    @Column(name = "FechaEnvio")
    private LocalDate fechaEnvio;

    // Muchas notificaciones -> un usuario
    @ManyToOne
    @JoinColumn(name = "IdUsuario", nullable = false)
    private C_Usuario usuario;
}

