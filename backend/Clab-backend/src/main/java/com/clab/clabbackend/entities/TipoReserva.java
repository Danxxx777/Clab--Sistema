package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "r_tipo_reserva", schema = "reservas")
public class TipoReserva {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_reserva")
    private Integer idTipoReserva;

    @Column(name = "nombre_tipo", length = 80, nullable = false)
    private String nombreTipo;

    @Column(name = "descripcion", length = 200)
    private String descripcion;

    @Column(name = "estado", length = 15)
    private String estado;

    @Column(name = "requiere_asignatura")
    private Boolean requiereAsignatura = true;
}
