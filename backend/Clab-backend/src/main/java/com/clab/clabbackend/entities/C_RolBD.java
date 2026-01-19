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
public class C_RolBD {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdRolBd")
    private Integer idRolBd;

    @Column(name = "NombreRolBd", length = 50, nullable = false, unique = true)
    private String nombreRolBd;

    @Column(name = "Descripcion", length = 200)
    private String descripcion;

    @Column(name = "FechaCreacion", nullable = false)
    private LocalDate fechaCreacion;

    @OneToMany(mappedBy = "rolBd")
    private List<C_UsuarioRolBD> usuarios;
}
