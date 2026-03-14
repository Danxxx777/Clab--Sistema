package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.reporte.*;
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

    // ── Resumen global (para el dashboard de reportes) ────────────────────────
    @GetMapping("/resumen-global")
    public ResponseEntity<ResumenGlobalDTO> getResumenGlobal() {
        return ResponseEntity.ok(reportesService.getResumenGlobal());
    }

    // ── Equipos / Inventario ──────────────────────────────────────────────────
    // GET /api/reportes/equipos?laboratorio=1&estado=OPERATIVO
    @GetMapping("/equipos")
    public ResponseEntity<ReporteEquipoDTO> getReporteEquipos(
            @RequestParam(required = false) Integer laboratorio,
            @RequestParam(required = false) String  estado
    ) {
        return ResponseEntity.ok(reportesService.getReporteEquipos(laboratorio, estado));
    }

    // ── Uso de laboratorios ───────────────────────────────────────────────────
    // GET /api/reportes/uso?laboratorio=1&fechaInicio=2025-01-01&fechaFin=2025-12-31&estado=APROBADA
    @GetMapping("/uso")
    public ResponseEntity<ReporteUsoDTO> getReporteUso(
            @RequestParam(required = false) Integer laboratorio,
            @RequestParam(required = false) String  fechaInicio,
            @RequestParam(required = false) String  fechaFin,
            @RequestParam(required = false) String  estado
    ) {
        return ResponseEntity.ok(reportesService.getReporteUso(laboratorio, fechaInicio, fechaFin, estado));
    }

    // ── Fallas ────────────────────────────────────────────────────────────────
    // GET /api/reportes/fallas?laboratorio=1&fechaInicio=2025-01-01&fechaFin=2025-12-31
    @GetMapping("/fallas")
    public ResponseEntity<ReporteFallasDTO> getReporteFallas(
            @RequestParam(required = false) Integer laboratorio,
            @RequestParam(required = false) String  fechaInicio,
            @RequestParam(required = false) String  fechaFin
    ) {
        return ResponseEntity.ok(reportesService.getReporteFallas(laboratorio, fechaInicio, fechaFin));
    }

    // ── Reservas ──────────────────────────────────────────────────────────────
    // GET /api/reportes/reservas?laboratorio=1&fechaInicio=2025-01-01&fechaFin=2025-12-31&estado=APROBADA
    @GetMapping("/reservas")
    public ResponseEntity<ReporteReservasDTO> getReporteReservas(
            @RequestParam(required = false) Integer laboratorio,
            @RequestParam(required = false) String  fechaInicio,
            @RequestParam(required = false) String  fechaFin,
            @RequestParam(required = false) String  estado
    ) {
        return ResponseEntity.ok(reportesService.getReporteReservas(laboratorio, fechaInicio, fechaFin, estado));
    }

    // ── Asistencia ────────────────────────────────────────────────────────────
    // GET /api/reportes/asistencia?laboratorio=1&fechaInicio=2025-01-01&fechaFin=2025-12-31
    @GetMapping("/asistencia")
    public ResponseEntity<ReporteAsistenciaDTO> getReporteAsistencia(
            @RequestParam(required = false) Integer laboratorio,
            @RequestParam(required = false) String  fechaInicio,
            @RequestParam(required = false) String  fechaFin
    ) {
        return ResponseEntity.ok(reportesService.getReporteAsistencia(laboratorio, fechaInicio, fechaFin));
    }

    // ── Usuarios ──────────────────────────────────────────────────────────────
    // GET /api/reportes/usuarios?estado=ACTIVO
    @GetMapping("/usuarios")
    public ResponseEntity<ReporteUsuariosDTO> getReporteUsuarios(
            @RequestParam(required = false) String estado
    ) {
        return ResponseEntity.ok(reportesService.getReporteUsuarios(estado));
    }

    // ── Bloqueos ──────────────────────────────────────────────────────────────
    // GET /api/reportes/bloqueos?laboratorio=1&fechaInicio=2025-01-01&fechaFin=2025-12-31&estado=ACTIVO
    @GetMapping("/bloqueos")
    public ResponseEntity<ReporteBloqueosDTO> getReporteBloqueos(
            @RequestParam(required = false) Integer laboratorio,
            @RequestParam(required = false) String  fechaInicio,
            @RequestParam(required = false) String  fechaFin,
            @RequestParam(required = false) String  estado
    ) {
        return ResponseEntity.ok(reportesService.getReporteBloqueos(laboratorio, fechaInicio, fechaFin, estado));
    }

    // ── Académico ─────────────────────────────────────────────────────────────
    // GET /api/reportes/academico?laboratorio=1&fechaInicio=2025-01-01&fechaFin=2025-12-31
    @GetMapping("/academico")
    public ResponseEntity<ReporteAcademicoDTO> getReporteAcademico(
            @RequestParam(required = false) Integer laboratorio,
            @RequestParam(required = false) String  fechaInicio,
            @RequestParam(required = false) String  fechaFin
    ) {
        return ResponseEntity.ok(reportesService.getReporteAcademico(laboratorio, fechaInicio, fechaFin));
    }
}
