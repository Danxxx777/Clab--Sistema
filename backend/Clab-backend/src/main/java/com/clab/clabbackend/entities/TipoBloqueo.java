package com.clab.clabbackend.entities;


import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "l_tipo_bloqueo", schema = "laboratorios")
public class TipoBloqueo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_bloqueo")
    private Integer idTipoBloqueo;

    @Column(name = "nombre_tipo", length = 80, nullable = false)
    private String nombreTipo;

    @Column(name = "descripcion", length = 200)
    private String descripcion;

    @Column(name = "estado", length = 15)
    private String estado;
}
