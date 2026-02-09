package com.clab.clabbackend.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "u_modulo", schema = "usuarios")
public class Modulo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idModulo;

    private String nombreModulo;
    private String descripcion;
}
