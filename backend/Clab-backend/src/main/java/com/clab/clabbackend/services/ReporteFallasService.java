package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.ReporteFallasDTO;
import com.clab.clabbackend.repository.ReporteFallasRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReporteFallasService {

    private final ReporteFallasRepository reporteRepository;

    // LISTAR
    public List<Map<String, Object>> listar() {
        List<Object[]> resultados = reporteRepository.listarReportes();

        List<Map<String, Object>> reportes = new ArrayList<>();

        for (Object[] r : resultados) {
            Map<String, Object> reporte = new HashMap<>();
            reporte.put("idReporte", r[0]);
            reporte.put("fechaReporte", r[1] != null ?
                    ((java.sql.Date) r[1]).toLocalDate() : null);
            reporte.put("descripcionFalla", r[2]);

            // Laboratorio
            Map<String, Object> laboratorio = new HashMap<>();
            laboratorio.put("codLaboratorio", r[3]);
            laboratorio.put("nombreLab", r[4]);
            reporte.put("laboratorio", laboratorio);

            // Equipo
            Map<String, Object> equipo = new HashMap<>();
            equipo.put("idEquipo", r[5]);
            equipo.put("nombreEquipo", r[6]);
            equipo.put("marca", r[7]);
            equipo.put("modelo", r[8]);
            reporte.put("equipo", equipo);

            // Usuario
            Map<String, Object> usuario = new HashMap<>();
            usuario.put("idUsuario", r[9]);
            usuario.put("email", r[10]);
            reporte.put("usuario", usuario);

            reportes.add(reporte);
        }

        return reportes;
    }

    // CREAR
    public void crear(ReporteFallasDTO dto) {
        reporteRepository.insertar(
                dto.getCodLaboratorio(),
                dto.getIdEquipo(),
                dto.getIdUsuario(),
                dto.getDescripcionFalla()
        );
    }

    // ELIMINAR
    public void eliminar(Integer id) {
        reporteRepository.eliminar(id);
    }
}