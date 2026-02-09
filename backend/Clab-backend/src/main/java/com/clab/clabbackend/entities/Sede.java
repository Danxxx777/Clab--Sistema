package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "o_sede", schema = "organizacion")
public class Sede {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sede")
    private Integer idSede;

    @Column(name = "nombre", length = 150, nullable = false)
    private String nombre;

    @Column(name = "direccion", length = 250)
    private String direccion;

    @Column(name = "telefono", length = 25)
    private String telefono;

    @Column(name = "email", length = 120)
    private String email;

    @Column(name = "estado", length = 15, nullable = false)
    private String estado;
}
