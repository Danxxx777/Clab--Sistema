package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "r_reserva_afectada_bloqueo", schema = "reservas")
public class ReservaAfectadaBloqueo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reserva_afectada")
    private Integer idReservaAfectada;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_reserva", nullable = false)
    private Reserva reserva;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_bloqueo", nullable = false)
    private BloqueoLab bloqueo;

    @Column(name = "notificacion_enviada", nullable = false)
    private Boolean notificacionEnviada;

    @Column(name = "fecha_notificacion")
    private LocalDate fechaNotificacion;

    @Column(name = "accion_tomada", length = 15, nullable = false)
    private String accionTomada;
}
