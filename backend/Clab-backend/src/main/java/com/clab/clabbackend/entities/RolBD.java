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
@Table(name = "rol_bd", schema = "seguridad_bd")
public class RolBD {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol_bd")
    private Integer idRolBd;

    @Column(name = "nombre_rol_bd", length = 50, nullable = false)
    private String nombreRolBd;

    @Column(name = "descripcion", length = 200)
    private String descripcion;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDate fechaCreacion;
}
