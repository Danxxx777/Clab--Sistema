package com.clab.clabbackend.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "u_rol_permiso", schema = "usuarios")
public class RolPermiso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idRolPermiso;

    @ManyToOne
    @JoinColumn(name = "id_rol")
    private Rol rol;

    @ManyToOne
    @JoinColumn(name = "id_modulo")
    private Modulo modulo;
    @ManyToOne
    @JoinColumn(name = "id_permiso")
    private Permiso permiso;

    private Boolean vigente;
}
