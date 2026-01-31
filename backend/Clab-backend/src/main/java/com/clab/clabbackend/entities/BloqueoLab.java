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
public class BloqueoLab {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdBloqueo")
    private Integer idBloqueo;

    @Column(name = "TipoBloqueo", nullable = false, length = 50)
    private String tipoBloqueo;

    @Column(name = "Motivo", length = 200, nullable = false)
    private String motivo;

    @Column(name = "FechaInicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "FechaFin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "AfectaReservaExistentes", nullable = false)
    private Boolean afectaReservasExistentes;

    @Column(name = "Estado", nullable = false, length = 15)
    private String estado;

    // Muchos bloqueos -> un laboratorio
    @ManyToOne
    @JoinColumn(name = "IdLaboratorio", nullable = false)
    private Laboratorio laboratorio;

    // Usuario que crea el bloqueo
    @ManyToOne
    @JoinColumn(name = "IdUsuario", nullable = false)
    private Usuario usuario;

    // Un bloqueo -> muchas reservas afectadas
    @OneToMany(mappedBy = "bloqueo")
    private List<ReservaAfectadaBloqueo> reservasAfectadas;
}
