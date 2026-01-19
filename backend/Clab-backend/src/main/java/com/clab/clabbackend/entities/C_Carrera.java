package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class C_Carrera {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdCarrera")
    private Integer idCarrera;

    @Column(name = "Nombre", length = 150, nullable = false)
    private String nombre;

    @Column(name = "Facultad", length = 100)
    private String facultad;

    @Column(name = "Estado", nullable = false, length = 15)
    private String estado;

    // Muchas carreras -> una institución
    @ManyToOne
    @JoinColumn(name = "IdInstitucion", nullable = false)
    private C_Institucion institucion;

    // Coordinador de la carrera (opcional)
    @ManyToOne
    @JoinColumn(name = "IdCoordinador")
    private C_Usuario coordinador;

    // Una carrera -> muchas asignaturas
    @OneToMany(mappedBy = "carrera")
    private List<C_Asignatura> asignaturas;
}
