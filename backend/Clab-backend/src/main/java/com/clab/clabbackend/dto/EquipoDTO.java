package com.clab.clabbackend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class EquipoDTO {

    private String numeroSerie;
    private String nombreEquipo;
    private String marca;
    private String modelo;
    private Integer idTipoEquipo;
    private String estado;
    private Integer codLaboratorio;
    private String ubicacionFisica;
    private LocalDate fechaAdquisicion;
}
