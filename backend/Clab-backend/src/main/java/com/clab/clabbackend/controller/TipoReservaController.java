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

    @GetMapping("/listar")
    public ResponseEntity<List<TipoReserva>> listar() {
        return ResponseEntity.ok(tipoReservaService.listar());
    }

    @PostMapping("/crear")
    public ResponseEntity<Void> crear(@RequestBody TipoReservaDTO dto) {
        tipoReservaService.crear(dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Void> actualizar(@PathVariable Integer id,
                                           @RequestBody TipoReservaDTO dto) {
        tipoReservaService.actualizar(id, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        tipoReservaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}