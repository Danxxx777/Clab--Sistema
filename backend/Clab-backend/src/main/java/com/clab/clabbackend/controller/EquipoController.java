package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.EquipoDTO;
import com.clab.clabbackend.entities.Equipo;
import com.clab.clabbackend.services.EquipoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/equipos")
@RequiredArgsConstructor
public class EquipoController {

    private final EquipoService equipoService;

    // LISTAR (usa función almacenada)
    @GetMapping
    public ResponseEntity<List<Equipo>> listar() {
        return ResponseEntity.ok(equipoService.listar());
    }

    @GetMapping("/porLaboratorio/{codLaboratorio}")
    public ResponseEntity<List<Equipo>> equiposPorLaboratorio(
            @PathVariable Integer codLaboratorio) {
        return ResponseEntity.ok(equipoService.equiposPorLaboratorio(codLaboratorio));
    }

    // CREAR (usa procedimiento almacenado)
    @PostMapping
    public ResponseEntity<Void> crear(@RequestBody EquipoDTO dto) {
        equipoService.crear(dto);
        return ResponseEntity.ok().build();
    }

    // ACTUALIZAR (usa procedimiento almacenado)
    @PutMapping("/{id}")
    public ResponseEntity<Void> editar(
            @PathVariable Integer id,
            @RequestBody EquipoDTO dto
    ) {
        equipoService.editar(id, dto);
        return ResponseEntity.ok().build();
    }

    // BAJA LÓGICA
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        equipoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
