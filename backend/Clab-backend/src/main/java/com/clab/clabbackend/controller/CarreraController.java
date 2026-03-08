package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.CarreraDTO;
import com.clab.clabbackend.services.CarreraService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carreras")
public class CarreraController {

    private final CarreraService carreraService;

    // Constructor para inyectar el servicio
    public CarreraController(CarreraService carreraService) {
        this.carreraService = carreraService;
    }

    // Obtiene la lista de todas las carreras
    @GetMapping
    public ResponseEntity<?> listar() {
        return ResponseEntity.ok(carreraService.listar());
    }

    // Obtiene la lista de coordinadores de carrera
    @GetMapping("/coordinadores")
    public ResponseEntity<?> listarCoordinadores() {
        return ResponseEntity.ok(carreraService.listarCoordinadores());
    }

    // Crea una nueva carrera
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody CarreraDTO dto) {
        carreraService.crear(dto);
        return ResponseEntity.ok().build();
    }

    // Actualiza una carrera existente por su ID
    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Integer id, @RequestBody CarreraDTO dto) {
        carreraService.editar(id, dto);
        return ResponseEntity.ok().build();
    }

    // Elimina una carrera por su ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        carreraService.eliminar(id);
        return ResponseEntity.ok().build();
    }
}