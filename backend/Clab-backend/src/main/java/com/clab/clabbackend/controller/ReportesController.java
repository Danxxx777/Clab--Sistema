package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.reporte.ReporteEquipoDTO;
import com.clab.clabbackend.services.ReportesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ReportesController {

    private final ReportesService reportesService;

    // GET /api/reportes/equipos?laboratorio=1&estado=OPERATIVO
    @GetMapping("/equipos")
    public ResponseEntity<ReporteEquipoDTO> getReporteEquipos(
            @RequestParam(required = false) Integer laboratorio,
            @RequestParam(required = false) String  estado
    ) {
        return ResponseEntity.ok(reportesService.getReporteEquipos(laboratorio, estado));
    }
}