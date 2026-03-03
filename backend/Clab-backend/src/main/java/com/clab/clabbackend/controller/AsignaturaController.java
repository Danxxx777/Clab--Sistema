package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.AsignaturaDTO;
import com.clab.clabbackend.services.AsignaturaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/asignaturas")
@RequiredArgsConstructor
public class AsignaturaController {

    // Servicio que contiene la lógica de negocio
    private final AsignaturaService asignaturaService;
    // Obtiene la lista de todas las asignaturas
    @GetMapping
    public ResponseEntity<?> listar() {
        return ResponseEntity.ok(asignaturaService.listar());
    }

    // Crea una nueva asignatura
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody AsignaturaDTO dto) {
        asignaturaService.crear(dto);
        return ResponseEntity.ok().build();
    }

    // Actualiza una asignatura existente por su ID
    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Integer id, @RequestBody AsignaturaDTO dto) {
        asignaturaService.editar(id, dto);
        return ResponseEntity.ok().build();
    }

    // Elimina una asignatura por su ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        asignaturaService.eliminar(id);
        return ResponseEntity.ok().build();
    }
}