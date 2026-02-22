package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "r_cancelacion", schema = "reservas")
public class ReservaCancelacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cancelacion")
    private Integer idCancelacion;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_reserva", nullable = false)
    private Reserva reserva;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario_cancela", nullable = false)
    private Usuario usuarioCancela;

    @Column(name = "fecha_cancelacion", nullable = false)
    private LocalDate fechaCancelacion;

    @Column(name = "motivo_cancelacion", length = 200, nullable = false)
    private String motivoCancelacion;
}