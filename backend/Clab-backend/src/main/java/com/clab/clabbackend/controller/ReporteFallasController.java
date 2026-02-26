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

    @GetMapping("/listar")
    public ResponseEntity<List<Map<String, Object>>> listar() {
        return ResponseEntity.ok(reporteService.listar());
    }

    @PostMapping("/crear")
    public ResponseEntity<Void> crear(@RequestBody ReporteFallasDTO dto) {
        reporteService.crear(dto);
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        reporteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}