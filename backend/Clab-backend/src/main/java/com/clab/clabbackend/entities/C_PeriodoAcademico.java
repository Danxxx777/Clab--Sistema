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
public class C_PeriodoAcademico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdPeriodo")
    private Integer idPeriodo;

    @Column(name = "NombrePeriodo", length = 50, nullable = false)
    private String nombrePeriodo;

    @Column(name = "FechaInicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "FechaFin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "FechaCreacion", nullable = false)
    private LocalDate fechaCreacion;

    // Un periodo -> muchos horarios académicos
    @OneToMany(mappedBy = "periodo")
    private List<C_HorarioAcademico> horarios;

    // Un periodo -> muchas reservas
    @OneToMany(mappedBy = "periodo")
    private List<C_Reserva> reservas;

    // Un periodo -> muchos reportes de uso
    @OneToMany(mappedBy = "periodo")
    private List<C_ReporteUso> reportesUso;
}
