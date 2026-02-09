package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "u_rol_rol_bd", schema = "usuarios")
public class RolRolBD {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol_rol_bd")
    private Integer idRolRolBd;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_rol", nullable = false)
    private Rol rol;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_rol_bd", nullable = false)
    private RolBD rolBd;

    @Column(name = "fecha_asignacion", nullable = false)
    private LocalDate fechaAsignacion;

    @Column(name = "vigente", nullable = false)
    private Boolean vigente;
}
