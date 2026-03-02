package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.CancelacionDTO;
import com.clab.clabbackend.dto.ReservaDTO;
import com.clab.clabbackend.services.ReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;

    @GetMapping("/listar")
    public ResponseEntity<List<Map<String, Object>>> listar() {
        return ResponseEntity.ok(reservaService.listar());
    }

    @GetMapping("/usuario/{id}")
    public ResponseEntity<List<Map<String, Object>>> listarPorUsuario(@PathVariable Integer id) {
        return ResponseEntity.ok(reservaService.listarPorUsuario(id));
    }

    @PostMapping("/crear")
    public ResponseEntity<Void> crear(@RequestBody ReservaDTO dto) {
        reservaService.crear(dto);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/crear-admin")
    public ResponseEntity<Void> crearAdmin(@RequestBody ReservaDTO dto) {
        reservaService.crearAdmin(dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Void> actualizar(
            @PathVariable Integer id,
            @RequestBody ReservaDTO dto) {
        reservaService.actualizar(id, dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/cancelar")
    public ResponseEntity<Void> cancelar(@RequestBody CancelacionDTO dto) {
        reservaService.cancelar(dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/aprobar/{id}")
    public ResponseEntity<Void> aprobar(@PathVariable Integer id) {
        reservaService.aprobar(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/rechazar/{id}")
    public ResponseEntity<Void> rechazar(@PathVariable Integer id) {
        reservaService.rechazar(id);
        return ResponseEntity.ok().build();
    }
}