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
@Table(name = "i_equipo", schema = "inventario")
public class Equipo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_equipo")
    private Integer idEquipo;

    @Column(name = "numero_serie", length = 50, nullable = false)
    private String numeroSerie;

    @Column(name = "nombre_equipo", length = 100, nullable = false)
    private String nombreEquipo;

    @Column(name = "marca", length = 50, nullable = false)
    private String marca;

    @Column(name = "modelo", length = 50, nullable = false)
    private String modelo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_tipo_equipo", nullable = false)
    private TipoEquipo tipoEquipo;

    @Column(name = "estado", length = 15, nullable = false)
    private String estado;

    @Column(name = "ubicacion_fisica", length = 100)
    private String ubicacionFisica;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cod_laboratorio", nullable = false)
    private Laboratorio laboratorio;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "fecha_adquisicion", nullable = false)
    private LocalDate fechaAdquisicion;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDate fechaRegistro;

    @Column(name = "ultimo_reporte", nullable = false)
    private LocalDate ultimoReporte;
}
//xd