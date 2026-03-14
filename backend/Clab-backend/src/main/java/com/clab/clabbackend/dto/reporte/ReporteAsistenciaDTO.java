package com.clab.clabbackend.dto.reporte;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ReporteAsistenciaDTO {

    private Map<String, Object>    stats;
    private List<GraficaItem>      grafica1;   // asistencias por laboratorio
    private List<GraficaItem>      grafica2;   // asistencias por fecha (top días)
    private List<AsistenciaItem>   datos;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class GraficaItem {
        private String label;
        private int    valor;
        private int    pct;
    }

    @Getter @Setter @NoArgsConstructor
    public static class AsistenciaItem {
        private String fecha;
        private String laboratorio;
        private String docente;
        private String horaApertura;
        private String observaciones;
    }
}
