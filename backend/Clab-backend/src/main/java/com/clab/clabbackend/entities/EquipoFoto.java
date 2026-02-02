package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "r_equipo_foto", schema = "recursos")
public class EquipoFoto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_equipo_foto")
    private Integer idEquipoFoto;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_equipo", nullable = false)
    private Equipo equipo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_foto", nullable = false)
    private Foto foto;
}
//xd