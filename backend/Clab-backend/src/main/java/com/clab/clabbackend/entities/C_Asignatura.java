package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class C_Asignatura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdAsignatura")
    private Integer idAsignatura;

    @Column(name = "Nombre", length = 150, nullable = false)
    private String nombre;

    @Column(name = "Nivel")
    private Integer nivel;

    @Column(name = "HorasSemanales")
    private Integer horasSemanales;

    @Column(name = "RequiereLaboratorio", nullable = false)
    private Boolean requiereLaboratorio;

    @Column(name = "Estado", nullable = false, length = 15)
    private String estado;

    // Muchas asignaturas -> una carrera
    @ManyToOne
    @JoinColumn(name = "Id_Carrera", nullable = false)
    private C_Carrera carrera;

    // Una asignatura -> muchos horarios académicos
    @OneToMany(mappedBy = "asignatura")
    private List<C_HorarioAcademico> horarios;

}

