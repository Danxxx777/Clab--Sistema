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
@Table(name = "u_rol", schema = "usuarios")
public class Rol {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol")
    private Integer idRol;

    @Column(name = "nombre_rol", length = 50, nullable = false)
    private String nombreRol;

    @Column(name = "descripcion", length = 200)
    private String descripcion;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDate fechaCreacion;
}
//xd