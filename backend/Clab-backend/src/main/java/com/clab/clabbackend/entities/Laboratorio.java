package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "l_laboratorio", schema = "laboratorios")
public class Laboratorio {
    @Id
    @Column(name = "cod_laboratorio")
    private Integer codLaboratorio;

    @Column(name = "nombre_lab", length = 100, nullable = false)
    private String nombreLab;

    @Column(name = "ubicacion", length = 200)
    private String ubicacion;

    @Column(name = "capacidad_estudiantes")
    private Integer capacidadEstudiantes;

    @Column(name = "numero_equipos")
    private Integer numeroEquipos;

    @Column(name = "descripcion", length = 200)
    private String descripcion;

    @Column(name = "estado_lab", length = 15, nullable = false)
    private String estadoLab;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_sede", nullable = false)
    private Sede sede;
}
//xd