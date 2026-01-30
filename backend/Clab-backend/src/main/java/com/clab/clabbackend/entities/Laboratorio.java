package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Laboratorio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdLaboratorio")
    private Integer idLaboratorio;

    @Column(name = "CodigoLab", length = 20, nullable = false, unique = true)
    private String codigoLab;

    @Column(name = "Nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "Ubicacion", length = 200)
    private String ubicacion;

    @Column(name = "CapacidadEstudiantes")
    private Integer capacidadEstudiantes;

    @Column(name = "NumeroEquipos")
    private Integer numeroEquipos;

    @Column(name = "Descripcion", length = 200)
    private String descripcion;

    @Column(name = "EstadoLab", nullable = false, length = 15)
    private String estadoLab;

    // Muchos laboratorios -> una institución
    @ManyToOne
    @JoinColumn(name = "IdInstitucion", nullable = false)
    private Institucion institucion;

    // Usuario responsable del laboratorio
    @ManyToOne
    @JoinColumn(name = "IdUsuario", nullable = false)
    private Usuario usuarioResponsable;

    // Fotos del laboratorio (tabla puente)
    @OneToMany(mappedBy = "laboratorio")
    private List<LaboratorioFoto> fotos;
}
