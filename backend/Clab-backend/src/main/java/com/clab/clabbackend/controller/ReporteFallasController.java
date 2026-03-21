package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.ReporteFallasDTO;
import com.clab.clabbackend.services.ReporteFallasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reportes")
@RequiredArgsConstructor
public class ReporteFallasController {

    private final ReporteFallasService reporteService;

    // Lista todos los reportes de fallas
    @GetMapping("/listar")
    public ResponseEntity<List<Map<String, Object>>> listar() {
        return ResponseEntity.ok(reporteService.listar());
    }

    @GetMapping("/listarPorEncargado/{idUsuario}")
    public ResponseEntity<List<Map<String, Object>>> listarPorEncargado(@PathVariable Integer idUsuario) {
        return ResponseEntity.ok(reporteService.listarPorEncargado(idUsuario));
    }

    // Crea un nuevo reporte de fallas
    @PostMapping("/crear")
    public ResponseEntity<Void> crear(@RequestBody ReporteFallasDTO dto) {
        reporteService.crear(dto);
        return ResponseEntity.ok().build();
    }

    // Elimina un reporte de fallas por su ID
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        reporteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}