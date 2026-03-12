package com.clab.clabbackend.dto.reporte;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ReporteEquipoDTO {

    private Map<String, Object> stats;
    private List<GraficaItem>   grafica1;
    private List<GraficaItem>   grafica2;
    private List<EquipoItem>    datos;

    // ── Ítem de gráfica ──────────────────────────────────────────────────────
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class GraficaItem {
        private String label;
        private int    valor;
        private int    pct;
    }

    // ── Ítem de tabla ────────────────────────────────────────────────────────
    @Getter @Setter @NoArgsConstructor
    public static class EquipoItem {
        private String serie;
        private String nombre;
        private String tipo;
        private String laboratorio;
        private String estado;
        private String marca;
        private String modelo;
        private String ubicacion;
    }
}