package com.clab.clabbackend.dto.reporte;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ReporteUsuariosDTO {

    private Map<String, Object>  stats;
    private List<GraficaItem>    grafica1;   // usuarios por rol
    private List<GraficaItem>    grafica2;   // usuarios por estado
    private List<UsuarioItem>    datos;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class GraficaItem {
        private String label;
        private int    valor;
        private int    pct;
    }

    @Getter @Setter @NoArgsConstructor
    public static class UsuarioItem {
        private Integer idUsuario;
        private String identidad;
        private String nombreCompleto;
        private String email;
        private String usuario;
        private String estado;
    }
}
