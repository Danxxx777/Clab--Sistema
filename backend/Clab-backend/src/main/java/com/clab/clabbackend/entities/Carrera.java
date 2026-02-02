package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "a_carrera", schema = "academico")
public class Carrera {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_carrera")
    private Integer idCarrera;

    @Column(name = "nombre_carrera", length = 150, nullable = false)
    private String nombreCarrera;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_facultad", nullable = false)
    private Facultad facultad;

    @ManyToOne
    @JoinColumn(name = "id_coordinador")
    private Usuario coordinador;

    @Column(name = "estado", length = 15, nullable = false)
    private String estado;
}
//xd