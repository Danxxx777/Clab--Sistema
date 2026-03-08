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

    // Servicio que contiene la lógica de negocio
    private final ReservaService reservaService;

    // Lista todas las reservas
    @GetMapping("/listar")
    public ResponseEntity<List<Map<String, Object>>> listar() {
        return ResponseEntity.ok(reservaService.listar());
    }

    // Lista las reservas de un usuario específico
    @GetMapping("/usuario/{id}")
    public ResponseEntity<List<Map<String, Object>>> listarPorUsuario(
            @PathVariable Integer id) {
        return ResponseEntity.ok(reservaService.listarPorUsuario(id));
    }

    @GetMapping("/listarPorEncargado/{idUsuario}")
    public ResponseEntity<List<Map<String, Object>>> listarPorEncargado(@PathVariable Integer idUsuario) {
        return ResponseEntity.ok(reservaService.listarPorEncargado(idUsuario));
    }

    // Crea una nueva reserva (usuario normal)
    @PostMapping("/crear")
    public ResponseEntity<Void> crear(@RequestBody ReservaDTO dto) {
        reservaService.crear(dto);
        return ResponseEntity.ok().build();
    }

    // Crea una reserva desde perfil administrador
    @PostMapping("/crear-admin")
    public ResponseEntity<Void> crearAdmin(@RequestBody ReservaDTO dto) {
        reservaService.crearAdmin(dto);
        return ResponseEntity.ok().build();
    }

    // Actualiza una reserva existente
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Void> actualizar(
            @PathVariable Integer id,
            @RequestBody ReservaDTO dto) {
        reservaService.actualizar(id, dto);
        return ResponseEntity.ok().build();
    }

    // Cancela una reserva
    @PostMapping("/cancelar")
    public ResponseEntity<Void> cancelar(@RequestBody CancelacionDTO dto) {
        reservaService.cancelar(dto);
        return ResponseEntity.ok().build();
    }

    // Aprueba una reserva por su ID
    @PutMapping("/aprobar/{id}")
    public ResponseEntity<Void> aprobar(@PathVariable Integer id) {
        reservaService.aprobar(id);
        return ResponseEntity.ok().build();
    }

    // Rechaza una reserva por su ID
    @PutMapping("/rechazar/{id}")
    public ResponseEntity<Void> rechazar(@PathVariable Integer id) {
        reservaService.rechazar(id);
        return ResponseEntity.ok().build();
    }
}