package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Array;

@Data
@Entity
@Table(name = "c_modulo_sistema", schema = "configuracion")
public class ModuloSistema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_modulo")
    private Integer idModulo;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "ruta", length = 100, nullable = false)
    private String ruta;

    @Column(name = "icono", length = 100)
    private String icono;

    @Column(name = "orden")
    private Integer orden;

    @Column(name = "activo")
    private Boolean activo = true;

    @Column(name = "esquemas_relacionados", columnDefinition = "text[]")
    private String[] esquemasRelacionados;

    @Column(name = "descripcion", length = 200)
    private String descripcion;
}