package com.clab.clabbackend.entities;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class UsuarioRolBD {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdUsuarioRolBd")
    private Integer idUsuarioRolBd;

    @Column(name = "FechaAsignacion", nullable = false)
    private LocalDate fechaAsignacion;

    @Column(name = "Vigente", nullable = false)
    private Boolean vigente;

    @ManyToOne
    @JoinColumn(name = "IdUsuarioBd", nullable = false)
    private UsuarioBD usuarioBd;

    @ManyToOne
    @JoinColumn(name = "IdRolBd", nullable = false)
    private RolBD rolBd;
}
