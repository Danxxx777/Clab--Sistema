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
public class C_Foto {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "IdFoto")
    private Integer idFoto;

    @Column(name = "FechaSubida")
    private LocalDate fechaSubida;

    @Lob
    @Column(name = "FotoBinario", nullable = false)
    private byte[] fotoBinario;

    @Column(name = "Estado", length = 15)
    private String estado;
}
