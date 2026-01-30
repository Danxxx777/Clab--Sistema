package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Equipo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdEquipo")
    private Integer idEquipo;

    @Column(name = "NumeroSerie", length = 50, nullable = false, unique = true)
    private String numeroSerie;

    @Column(name = "Nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "Marca", length = 50, nullable = false)
    private String marca;

    @Column(name = "Modelo", length = 50, nullable = false)
    private String modelo;

    @Column(name = "TipoEquipo", nullable = false)
    private String tipoEquipo;

    @Column(nullable = false, length = 15)
    private String estado;

    @Column(name = "UbicacionFisica", length = 100)
    private String ubicacionFisica;

    @Column(name = "FechaAdquisicion", nullable = false)
    private LocalDate fechaAdquisicion;

    @Column(name = "FechaRegistro", nullable = false)
    private LocalDate fechaRegistro;

    @Column(name = "UltimaRevision", nullable = false)
    private LocalDate ultimaRevision;

    // Muchos equipos -> un laboratorio
    @ManyToOne
    @JoinColumn(name = "id_laboratorio", nullable = false)
    private Laboratorio laboratorio;

    // Usuario responsable del equipo
    @ManyToOne
    @JoinColumn(name = "IdUsuario", nullable = false)
    private Usuario usuario;

    // Fotos del equipo (tabla puente)
    @OneToMany(mappedBy = "equipo")
    private List<EquipoFoto> fotos;

    // Reportes de falla del equipo
    @OneToMany(mappedBy = "equipo")
    private List<ReporteFallas> reportes;
}
