package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.SedeDTO;
import com.clab.clabbackend.entities.Sede;
import com.clab.clabbackend.services.SedeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sedes")
@RequiredArgsConstructor
public class SedeController {

    private final SedeService sedeService;
    // Lista todas las sedes
    @GetMapping("/listar")
    public ResponseEntity<List<Sede>> listarSedes() {
        return ResponseEntity.ok(sedeService.listar());
    }

    // Crea una nueva sede
    @PostMapping("/crear")
    public ResponseEntity<Void> crearSede(@RequestBody SedeDTO dto) {
        sedeService.crear(dto);
        return ResponseEntity.ok().build();
    }

    // Actualiza una sede existente por su ID
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Void> actualizar(
            @PathVariable Integer id,
            @RequestBody SedeDTO dto) {

        sedeService.actualizar(id, dto);
        return ResponseEntity.ok().build();
    }

    // Elimina una sede por su ID
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminarSede(@PathVariable Integer id) {
        sedeService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}