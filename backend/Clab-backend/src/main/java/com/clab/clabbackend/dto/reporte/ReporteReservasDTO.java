package com.clab.clabbackend.dto.reporte;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ReporteReservasDTO {

    private Map<String, Object>   stats;
    private List<GraficaItem>     grafica1;   // reservas por laboratorio
    private List<GraficaItem>     grafica2;   // distribución por estado
    private List<ReservaItem>     datos;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class GraficaItem {
        private String label;
        private int    valor;
        private int    pct;
    }

    @Getter @Setter @NoArgsConstructor
    public static class ReservaItem {
        private String fecha;
        private String laboratorio;
        private String horario;
        private String tipo;
        private String motivo;
        private String numEstudiantes;
        private String estado;
    }
}
