package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"IdEquipo", "IdFoto"})
        }
)
public class EquipoFoto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdEquipoFoto")
    private Integer idEquipoFoto;

    // Muchas filas -> un equipo
    @ManyToOne
    @JoinColumn(name = "IdEquipo", nullable = false)
    private Equipo equipo;

    // Muchas filas -> una foto
    @ManyToOne
    @JoinColumn(name = "IdFoto", nullable = false)
    private Foto foto;
}
