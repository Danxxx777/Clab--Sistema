package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.TipoReservaDTO;
import com.clab.clabbackend.entities.TipoReserva;
import com.clab.clabbackend.services.TipoReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tipos-reserva")
@RequiredArgsConstructor
public class TipoReservaController {

    private final TipoReservaService tipoReservaService;

    // Lista todos los tipos de reserva
    @GetMapping("/listar")
    public ResponseEntity<List<TipoReserva>> listar() {
        return ResponseEntity.ok(tipoReservaService.listar());
    }

    // Crea un nuevo tipo de reserva
    @PostMapping("/crear")
    public ResponseEntity<Void> crear(@RequestBody TipoReservaDTO dto) {
        tipoReservaService.crear(dto);
        return ResponseEntity.ok().build();
    }

    // Actualiza un tipo de reserva existente por su ID
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Void> actualizar(
            @PathVariable Integer id,
            @RequestBody TipoReservaDTO dto) {

        tipoReservaService.actualizar(id, dto);
        return ResponseEntity.ok().build();
    }

    // Elimina un tipo de reserva por su ID
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        tipoReservaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}