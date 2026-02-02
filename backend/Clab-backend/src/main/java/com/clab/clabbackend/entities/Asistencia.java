package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "r_asistencia", schema = "reservas")
public class Asistencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asistencia")
    private Integer idAsistencia;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_reserva", nullable = false)
    private Reserva reserva;

    @Column(name = "identidad", length = 15, nullable = false)
    private String identidad;

    @Column(name = "nombres", length = 100, nullable = false)
    private String nombres;

    @Column(name = "apellidos", length = 100, nullable = false)
    private String apellidos;

    @Column(name = "nombre_laboratorio", length = 100, nullable = false)
    private String nombreLaboratorio;

    @Column(name = "asistio", nullable = false)
    private Boolean asistio;

    @Column(name = "observacion", length = 200)
    private String observacion;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario_registra", nullable = false)
    private Usuario usuarioRegistra;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDate fechaRegistro;
}
//xd