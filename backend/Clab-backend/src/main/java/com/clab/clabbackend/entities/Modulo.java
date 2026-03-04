package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "u_modulo", schema = "usuarios")
public class Modulo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_modulo")
    private Integer idModulo;

    @Column(name = "nombre_modulo", length = 255)
    private String nombreModulo;

    @Column(name = "descripcion", length = 255)
    private String descripcion;
}