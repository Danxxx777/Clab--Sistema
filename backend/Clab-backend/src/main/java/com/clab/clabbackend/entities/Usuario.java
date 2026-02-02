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
@Table(name = "u_usuario", schema = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @Column(name = "identidad", length = 15, nullable = false)
    private String identidad;

    @Column(name = "nombres", length = 100, nullable = false)
    private String nombres;

    @Column(name = "apellidos", length = 100, nullable = false)
    private String apellidos;

    @Column(name = "email", length = 100, nullable = false)
    private String email;

    @Column(name = "telefono", length = 25)
    private String telefono;

    @Column(name = "usuario", length = 50, nullable = false)
    private String usuario;

    @Column(name = "contrasena", length = 255, nullable = false)
    private String contrasena;

    // Antes era ENUM → ahora String(15)
    @Column(name = "estado", length = 15, nullable = false)
    private String estado;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDate fechaRegistro;

    @ManyToOne
    @JoinColumn(name = "id_foto")
    private Foto foto;
}
//xd