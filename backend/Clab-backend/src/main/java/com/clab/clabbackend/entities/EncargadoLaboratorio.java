package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "l_encargado_laboratorio", schema = "laboratorios")
public class EncargadoLaboratorio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_encargado_laboratorio")
    private Integer idEncargadoLaboratorio;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cod_laboratorio", nullable = false)
    private Laboratorio laboratorio;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "fecha_asignacion", nullable = false)
    private LocalDate fechaAsignacion;

    @Column(name = "vigente", nullable = false)
    private Boolean vigente;
}
//xd