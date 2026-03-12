package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.reporte.ReporteEquipoDTO;
import com.clab.clabbackend.dto.reporte.ReporteEquipoDTO.*;
import com.clab.clabbackend.repository.EquipoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportesService {

    private final EquipoRepository equipoRepository;

    public ReporteEquipoDTO getReporteEquipos(Integer laboratorio, String estado) {

        // 1. Llamar a la función PostgreSQL
        List<Object[]> rows = equipoRepository.reporteEquipos(laboratorio, estado);

        // 2. Mapear filas a DTOs
        List<EquipoItem> datos = rows.stream().map(r -> {
            EquipoItem item = new EquipoItem();
            item.setSerie(       str(r[0]));
            item.setNombre(      str(r[1]));
            item.setTipo(        str(r[2]));
            item.setLaboratorio( str(r[3]));
            item.setEstado(      str(r[4]));
            item.setMarca(       str(r[5]));
            item.setModelo(      str(r[6]));
            item.setUbicacion(   str(r[7]));
            return item;
        }).collect(Collectors.toList());

        // 3. Calcular stats
        long total         = datos.size();
        long operativos    = datos.stream().filter(d -> "OPERATIVO".equalsIgnoreCase(d.getEstado())).count();
        long mantenimiento = datos.stream().filter(d -> "MANTENIMIENTO".equalsIgnoreCase(d.getEstado())).count();
        long fuera         = datos.stream().filter(d -> "FUERA".equalsIgnoreCase(d.getEstado()) || "INACTIVO".equalsIgnoreCase(d.getEstado())).count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalEquipos",  total);
        stats.put("operativos",    operativos);
        stats.put("mantenimiento", mantenimiento);
        stats.put("fueraServicio", fuera);

        // 4. Grafica 1 — equipos por laboratorio
        Map<String, Long> porLab = datos.stream()
                .collect(Collectors.groupingBy(EquipoItem::getLaboratorio, Collectors.counting()));

        long maxLab = porLab.values().stream().mapToLong(v -> v).max().orElse(1);

        List<GraficaItem> grafica1 = porLab.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> new GraficaItem(
                        e.getKey(),
                        e.getValue().intValue(),
                        (int) Math.round(e.getValue() * 100.0 / maxLab)))
                .collect(Collectors.toList());

        // 5. Grafica 2 — distribución por estado
        Map<String, Long> porEstado = datos.stream()
                .collect(Collectors.groupingBy(EquipoItem::getEstado, Collectors.counting()));

        List<GraficaItem> grafica2 = porEstado.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> new GraficaItem(
                        e.getKey(),
                        e.getValue().intValue(),
                        (int) Math.round(e.getValue() * 100.0 / total)))
                .collect(Collectors.toList());

        // 6. Armar respuesta
        ReporteEquipoDTO response = new ReporteEquipoDTO();
        response.setStats(stats);
        response.setGrafica1(grafica1);
        response.setGrafica2(grafica2);
        response.setDatos(datos);
        return response;
    }

    private String str(Object o) {
        return o != null ? o.toString() : "";
    }
}