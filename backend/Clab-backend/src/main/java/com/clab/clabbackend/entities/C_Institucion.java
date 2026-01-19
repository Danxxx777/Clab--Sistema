package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.beans.ConstructorProperties;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class C_Institucion {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "IDInstitucion")
    private Integer idInstitucion;

    @Column(name = "Nombre", length = 50)
    private String nombre;

    @Column(name = "RUC", length = 20, unique = true, nullable = false)
    private String ruc;

    @Column(name = "RazonSocial", length = 200)
    private String razonSocial;

    @Column(name = "Direccion", length = 250)
    private String direccion;

    @Column(name = "Telefono", length = 25)
    private String telefono;

    @Column(name = "Email", length = 120)
    private String email;

    @Column(name = "Estado", length = 15)
    private String estado;

    // 1 Institución -> muchos Usuarios
    @OneToMany(mappedBy = "institucion")
    private List<C_Usuario> usuarios;

    // 1 Institución -> muchos Laboratorios
    @OneToMany(mappedBy = "institucion")
    private List<C_Laboratorio> laboratorios;

    // 1 Institución -> muchas Carreras
    @OneToMany(mappedBy = "institucion")
    private List<C_Carrera> carreras;

    // 1 Institución -> muchas Fotos (tabla puente)
    @OneToMany(mappedBy = "institucion")
    private List<C_Institucion_Foto> fotos;
}
