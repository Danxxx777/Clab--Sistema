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
public class InstitucionFoto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdInstitucionFoto")
    private Integer idInstitucionFoto;

    // Muchas filas -> una institución
    @ManyToOne
    @JoinColumn(name = "IdInstitucion", nullable = false)
    private Institucion institucion;

    // Muchas filas -> una foto
    @ManyToOne
    @JoinColumn(name = "IdFoto", nullable = false)
    private Foto foto;
}
