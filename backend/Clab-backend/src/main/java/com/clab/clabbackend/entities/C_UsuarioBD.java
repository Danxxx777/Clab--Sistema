package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class C_UsuarioBD {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdUsuarioBd")
    private Integer idUsuarioBd;

    @Column(name = "UsuarioBd", length = 100, nullable = false, unique = true)
    private String usuarioBd;

    @Column(name = "ContrasenaBd", length = 100, nullable = false)
    private String contrasenaBd;

    @Column(name = "Activo", nullable = false)
    private Boolean activo;

    // 1 a 1 con usuario del sistema
    @OneToOne
    @JoinColumn(name = "id_usuario", nullable = false, unique = true)
    private C_Usuario usuario;
}
