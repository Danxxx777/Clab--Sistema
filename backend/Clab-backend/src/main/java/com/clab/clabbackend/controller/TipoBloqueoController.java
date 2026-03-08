package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.TipoBloqueoDTO;
import com.clab.clabbackend.entities.TipoBloqueo;
import com.clab.clabbackend.services.TipoBloqueoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/tipos-bloqueos")
@RequiredArgsConstructor
public class TipoBloqueoController {
    private final TipoBloqueoService tipoBloqueoService;

    @GetMapping("/listar")
    public ResponseEntity<List<TipoBloqueo>> listar() {
        return ResponseEntity.ok(tipoBloqueoService.listar());
    }

    @PostMapping("/crear")
    public ResponseEntity<Void> crear(@RequestBody TipoBloqueoDTO dto) {
        tipoBloqueoService.crear(dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Void> actualizar(
            @PathVariable Integer id,
            @RequestBody TipoBloqueoDTO dto) {

        tipoBloqueoService.actualizar(id, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        tipoBloqueoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
