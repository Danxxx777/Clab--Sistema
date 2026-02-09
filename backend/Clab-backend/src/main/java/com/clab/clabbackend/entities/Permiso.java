package com.clab.clabbackend.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "u_permiso", schema = "usuarios")
public class Permiso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idPermiso;
    private String nombrePermiso;
}
