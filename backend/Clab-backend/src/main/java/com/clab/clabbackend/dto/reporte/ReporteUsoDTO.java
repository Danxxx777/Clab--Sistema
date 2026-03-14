package com.clab.clabbackend.dto.reporte;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ReporteUsoDTO {

    private Map<String, Object>  stats;
    private List<GraficaItem>    grafica1;   // reservas por laboratorio
    private List<GraficaItem>    grafica2;   // reservas por estado
    private List<UsoItem>        datos;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class GraficaItem {
        private String label;
        private int    valor;
        private int    pct;
    }

    @Getter @Setter @NoArgsConstructor
    public static class UsoItem {
        private String laboratorio;
        private String fecha;
        private String horario;
        private String numEstudiantes;
        private String tipoReserva;
        private String estado;
    }
}
