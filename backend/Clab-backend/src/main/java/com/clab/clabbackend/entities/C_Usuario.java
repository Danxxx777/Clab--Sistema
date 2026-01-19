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
public class C_Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdUsuario")
    private Integer idUsuario;

    @Column(name = "Identidad", length = 10, nullable = false, unique = true)
    private String identidad;

    @Column(name ="Nombres", length = 100, nullable = false)
    private String nombres;

    @Column(name = "Apellidos", length = 100, nullable = false)
    private String apellidos;

    @Column(name = "Email", length = 100, nullable = false, unique = true)
    private String email;

    @Column(name = "Telefono", length = 25)
    private String telefono;

    @Column(name = "Usuario" , length = 50, nullable = false, unique = true)
    private String usuario;

    @Column(name = "Contraseña", length = 255, nullable = false)
    private String contraseña;

    @Column(name = "EstadoUser", nullable = false,  length = 15)
    private String estadoUser;

    @Column(name = "FechaRegistro", nullable = false)
    private LocalDate fechaRegistro;

    // Muchos usuarios -> una institución
    @ManyToOne
    @JoinColumn(name = "IdInstitucion", nullable = false)
    private C_Institucion institucion;

    // Foto de perfil (opcional)
    @ManyToOne
    @JoinColumn(name = "IdFoto")
    private C_Foto foto;

    // Roles del usuario
    @OneToMany(mappedBy = "usuario")
    private List<C_UsuarioRol> roles;
}
