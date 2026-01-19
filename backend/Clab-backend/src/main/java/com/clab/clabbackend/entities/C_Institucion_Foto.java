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
                @UniqueConstraint(columnNames = {"IdInstitucion", "IdFoto"})
        }
)
public class C_Institucion_Foto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdInstitucionFoto")
    private Integer idInstitucionFoto;

    // Muchas filas -> una institución
    @ManyToOne
    @JoinColumn(name = "IdInstitucion", nullable = false)
    private C_Institucion institucion;

    // Muchas filas -> una foto
    @ManyToOne
    @JoinColumn(name = "IdFoto", nullable = false)
    private C_Foto foto;
}
