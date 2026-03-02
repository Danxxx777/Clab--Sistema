package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.AsignaturaDTO;
import com.clab.clabbackend.services.AsignaturaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/asignaturas")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class AsignaturaController {

    private final AsignaturaService asignaturaService;

    @GetMapping
    public ResponseEntity<?> listar() {
        return ResponseEntity.ok(asignaturaService.listar());
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody AsignaturaDTO dto) {
        asignaturaService.crear(dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Integer id, @RequestBody AsignaturaDTO dto) {
        asignaturaService.editar(id, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        asignaturaService.eliminar(id);
        return ResponseEntity.ok().build();
    }
}