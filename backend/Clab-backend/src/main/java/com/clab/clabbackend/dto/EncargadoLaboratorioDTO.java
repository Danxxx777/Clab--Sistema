package com.clab.clabbackend.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EncargadoLaboratorioDTO {
    private Integer idEncargadoLaboratorio;
    private Integer laboratorio;
    private Integer usuario;
    private LocalDate fechaAsignacion;
    private Boolean vigente;
}
