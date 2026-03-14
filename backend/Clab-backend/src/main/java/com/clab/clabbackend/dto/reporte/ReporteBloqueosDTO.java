package com.clab.clabbackend.dto.reporte;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ReporteBloqueosDTO {

    private Map<String, Object>  stats;
    private List<GraficaItem>    grafica1;   // bloqueos por laboratorio
    private List<GraficaItem>    grafica2;   // bloqueos por tipo
    private List<BloqueoItem>    datos;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class GraficaItem {
        private String label;
        private int    valor;
        private int    pct;
    }

    @Getter @Setter @NoArgsConstructor
    public static class BloqueoItem {
        private String laboratorio;
        private String tipo;
        private String motivo;
        private String fechaInicio;
        private String fechaFin;
        private String estado;
    }
}
