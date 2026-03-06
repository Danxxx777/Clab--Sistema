package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.BloqueoLabDTO;
import com.clab.clabbackend.services.BloqueoLabService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bloqueos")
public class BloqueoLabController {

    private final BloqueoLabService bloqueoLabService;

    public BloqueoLabController(BloqueoLabService bloqueoLabService) {
        this.bloqueoLabService = bloqueoLabService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listar() {
        return ResponseEntity.ok(bloqueoLabService.listar());
    }

    @PostMapping
    public ResponseEntity<Void> crear(
            @RequestBody BloqueoLabDTO dto,
            @RequestHeader("id-usuario") Integer idUsuario) {
        bloqueoLabService.crear(dto, idUsuario);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> actualizar(
            @PathVariable Integer id,
            @RequestBody BloqueoLabDTO dto) {
        bloqueoLabService.actualizar(id, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        bloqueoLabService.eliminar(id);
        return ResponseEntity.ok().build();
    }
}