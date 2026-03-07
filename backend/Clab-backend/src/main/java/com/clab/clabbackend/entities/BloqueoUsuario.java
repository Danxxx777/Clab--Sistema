package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "r_bloqueo_usuario", schema = "reservas")
public class BloqueoUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_bloqueo")
    private Integer idBloqueo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "motivo", length = 300)
    private String motivo;

    @Column(name = "fecha_bloqueo", nullable = false)
    private LocalDate fechaBloqueo;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}