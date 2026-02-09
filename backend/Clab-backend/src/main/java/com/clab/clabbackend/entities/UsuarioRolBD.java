/*package com.clab.clabbackend.entities;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "u_usuario_rol_bd", schema = "usuarios")
public class UsuarioRolBD {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario_rol_bd")
    private Integer idUsuarioRolBd;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario_bd", nullable = false)
    private UsuarioBD usuarioBd;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_rol_bd", nullable = false)
    private RolBD rolBd;

    @Column(name = "fecha_asignacion", nullable = false)
    private LocalDate fechaAsignacion;

    @Column(name = "vigente", nullable = false)
    private Boolean vigente;
}
*/