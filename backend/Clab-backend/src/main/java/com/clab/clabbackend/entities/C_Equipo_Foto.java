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
public class C_Equipo_Foto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdEquipoFoto")
    private Integer idEquipoFoto;

    // Muchas filas -> un equipo
    @ManyToOne
    @JoinColumn(name = "IdEquipo", nullable = false)
    private C_Equipo equipo;

    // Muchas filas -> una foto
    @ManyToOne
    @JoinColumn(name = "IdFoto", nullable = false)
    private C_Foto foto;
}
