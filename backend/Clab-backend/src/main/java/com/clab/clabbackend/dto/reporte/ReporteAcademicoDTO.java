package com.clab.clabbackend.dto.reporte;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ReporteAcademicoDTO {

    private Map<String, Object>   stats;
    private List<GraficaItem>     grafica1;   // reservas por asignatura
    private List<GraficaItem>     grafica2;   // reservas por carrera
    private List<AcademicoItem>   datos;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class GraficaItem {
        private String label;
        private int    valor;
        private int    pct;
    }

    @Getter @Setter @NoArgsConstructor
    public static class AcademicoItem {
        private String asignatura;
        private String carrera;
        private String docente;
        private String laboratorio;
        private String fecha;
        private String estado;
    }
}
