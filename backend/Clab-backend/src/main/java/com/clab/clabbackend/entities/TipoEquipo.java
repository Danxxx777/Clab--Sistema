package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "i_tipo_equipo", schema = "inventario")
public class TipoEquipo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_equipo")
    private Integer idTipoEquipo;

    @Column(name = "nombre_tipo", length = 80, nullable = false)
    private String nombreTipo;

    @Column(name = "descripcion", length = 200)
    private String descripcion;
}
//xd