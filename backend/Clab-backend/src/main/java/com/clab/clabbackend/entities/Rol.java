package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Rol {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdRol")
    private Integer idRol;

    @Column(name = "NombreRol", length = 50, nullable = false, unique = true)
    private String nombreRol;

    @Column(name = "Descripcion", length = 200)
    private String descripcion;

    @Column(name = "FechaCreacion", nullable = false)
    private LocalDate fechaCreacion;

    // Un rol -> muchos usuarios (vía tabla puente)
    @OneToMany(mappedBy = "rol")
    private List<UsuarioRol> usuarios;
}
