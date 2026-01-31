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
public class LaboratorioFoto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdLaboratorioFoto")
    private Integer idLaboratorioFoto;

    // Muchas filas -> un laboratorio
    @ManyToOne
    @JoinColumn(name = "IdLaboratorio", nullable = false)
    private Laboratorio laboratorio;

    // Muchas filas -> una foto
    @ManyToOne
    @JoinColumn(name = "IdFoto", nullable = false)
    private Foto foto;
}
