package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class UsuarioRol {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdUsuarioRol")
    private Integer idUsuarioRol;

    // Muchas filas -> un usuario
    @ManyToOne
    @JoinColumn(name = "IdUsuario", nullable = false)
    private Usuario usuario;

    // Muchas filas -> un rol
    @ManyToOne
    @JoinColumn(name = "IdRol", nullable = false)
    private Rol rol;

    @Column(name = "FechaAsignacion", nullable = false)
    private LocalDate fechaAsignacion;

    @Column(name = "Vigente", nullable = false)
    private Boolean vigente;
}
