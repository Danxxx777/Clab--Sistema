package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "o_facultad", schema = "organizacion")
public class Facultad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_facultad")
    private Integer idFacultad;

    @Column(name = "nombre", length = 150, nullable = false)
    private String nombre;

    @Column(name = "descripcion", length = 200)
    private String descripcion;

    @Column(name = "estado", length = 15, nullable = false)
    private String estado;

    @ManyToOne
    @JoinColumn(name = "id_decano")
    private Usuario decano;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDate fechaCreacion;
}
//xd