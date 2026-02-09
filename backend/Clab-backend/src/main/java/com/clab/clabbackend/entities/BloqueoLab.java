package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "l_bloqueo_lab", schema = "laboratorios")
public class BloqueoLab {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_bloqueo")
    private Integer idBloqueo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cod_laboratorio", nullable = false)
    private Laboratorio laboratorio;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "tipo_bloqueo", length = 15, nullable = false)
    private String tipoBloqueo;

    @Column(name = "motivo", length = 200, nullable = false)
    private String motivo;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "afecta_reservas_existentes", nullable = false)
    private Boolean afectaReservasExistentes;

    @Column(name = "estado", length = 15, nullable = false)
    private String estado;
}
