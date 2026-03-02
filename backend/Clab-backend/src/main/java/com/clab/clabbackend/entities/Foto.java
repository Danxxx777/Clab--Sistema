package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "r_foto", schema = "recursos")
public class Foto {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "id_foto")
    private Integer idFoto;

    @Column(name = "fecha_subida")
    private LocalDate fechaSubida;

    @Column(name = "url_foto", nullable = false)
    private String urlFoto;

    @Column(name = "public_id", nullable = false)
    private String publicId;

    @Column(name = "estado", length = 15)
    private String estado;
}
