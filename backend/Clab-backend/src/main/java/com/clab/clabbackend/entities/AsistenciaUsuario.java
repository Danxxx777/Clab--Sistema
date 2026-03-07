package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "r_asistencia_usuario", schema = "reservas")
public class AsistenciaUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asistencia")
    private Integer idAsistencia;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_reserva", nullable = false)
    private Reserva reserva;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "fecha_apertura", nullable = false)
    private LocalDate fechaApertura;

    @Column(name = "hora_apertura", nullable = false)
    private LocalTime horaApertura;

    @Column(name = "observaciones", length = 300)
    private String observaciones;
}