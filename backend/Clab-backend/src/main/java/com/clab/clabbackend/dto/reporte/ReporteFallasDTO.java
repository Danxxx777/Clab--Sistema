package com.clab.clabbackend.dto.reporte;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ReporteFallasDTO {

    private Map<String, Object>  stats;
    private List<GraficaItem>    grafica1;   // fallas por laboratorio
    private List<GraficaItem>    grafica2;   // fallas por equipo (top 5)
    private List<FallaItem>      datos;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class GraficaItem {
        private String label;
        private int    valor;
        private int    pct;
    }

    @Getter @Setter @NoArgsConstructor
    public static class FallaItem {
        private String idReporte;
        private String fecha;
        private String laboratorio;
        private String equipo;
        private String descripcion;
        private String reportadoPor;
        private String idUsuarioStr;
    }
}
