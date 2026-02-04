package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "u_usuario_bd", schema = "usuarios")
public class UsuarioBD {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario_bd")
    private Integer idUsuarioBd;

    @OneToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "usuario_bd", length = 100, nullable = false)
    private String usuarioBd;

    @Column(name = "contrasenia_bd", length = 100, nullable = false)
    private String contraseniaBd;

    @Column(name = "estado_user_bd", nullable = false,  length = 15)
    private String estadoUserBd;
}
