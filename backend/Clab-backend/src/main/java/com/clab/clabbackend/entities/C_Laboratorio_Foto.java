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
                @UniqueConstraint(columnNames = {"IdLaboratorio", "IdFoto"})
        }
)
public class C_Laboratorio_Foto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdLaboratorioFoto")
    private Integer idLaboratorioFoto;

    // Muchas filas -> un laboratorio
    @ManyToOne
    @JoinColumn(name = "IdLaboratorio", nullable = false)
    private C_Laboratorio laboratorio;

    // Muchas filas -> una foto
    @ManyToOne
    @JoinColumn(name = "IdFoto", nullable = false)
    private C_Foto foto;
}
