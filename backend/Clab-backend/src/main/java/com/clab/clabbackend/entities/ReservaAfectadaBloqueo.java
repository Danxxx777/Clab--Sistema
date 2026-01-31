package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"id_reserva", "id_bloqueo"})
        }
)
public class ReservaAfectadaBloqueo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdReservaAfectada")
    private Integer idReservaAfectada;

    @Column(name = "NotificacionEnviada", nullable = false)
    private Boolean notificacionEnviada;

    @Column(name = "FechaNotificacion")
    private LocalDate fechaNotificacion;

    @Column(name = "AccionTomada", nullable = false,  length = 100)
    private String accionTomada;

    // Muchas filas -> una reserva
    @ManyToOne
    @JoinColumn(name = "IdReserva", nullable = false)
    private Reserva reserva;

    // Muchas filas -> un bloqueo
    @ManyToOne
    @JoinColumn(name = "IdBloqueo", nullable = false)
    private BloqueoLab bloqueo;
}
