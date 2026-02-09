package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "a_asignatura", schema = "academico")
public class Asignatura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asignatura")
    private Integer idAsignatura;

    @Column(name = "nombre", length = 150, nullable = false)
    private String nombre;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_carrera", nullable = false)
    private Carrera carrera;

    @Column(name = "nivel")
    private Integer nivel;

    @Column(name = "horas_semanales")
    private Integer horasSemanales;

    @Column(name = "requiere_laboratorio", nullable = false)
    private Boolean requiereLaboratorio;

    @Column(name = "estado", length = 15, nullable = false)
    private String estado;
}

