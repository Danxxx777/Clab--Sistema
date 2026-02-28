package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.DecanoResponseDTO;
import com.clab.clabbackend.dto.FacultadDTO;
import com.clab.clabbackend.dto.FacultadResponseDTO;
import com.clab.clabbackend.services.FacultadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/facultades")
@RequiredArgsConstructor
public class FacultadController {

    private final FacultadService facultadService;

    // LISTAR FACULTADES
    @GetMapping
    public ResponseEntity<List<FacultadResponseDTO>> listar() {
        return ResponseEntity.ok(facultadService.listar());
    }

    // LISTAR DECANOS (para el dropdown del formulario)
    @GetMapping("/decanos")
    public ResponseEntity<List<DecanoResponseDTO>> listarDecanos() {
        return ResponseEntity.ok(facultadService.listarDecanos());
    }

    // CREAR
    @PostMapping
    public ResponseEntity<Void> crear(@RequestBody FacultadDTO dto) {
        facultadService.crear(dto);
        return ResponseEntity.ok().build();
    }

    // ACTUALIZAR
    @PutMapping("/{id}")
    public ResponseEntity<Void> editar(
            @PathVariable Integer id,
            @RequestBody FacultadDTO dto
    ) {
        facultadService.editar(id, dto);
        return ResponseEntity.ok().build();
    }

    // BAJA LÓGICA
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        facultadService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}