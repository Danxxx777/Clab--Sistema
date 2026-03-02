package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.CarreraDTO;
import com.clab.clabbackend.services.CarreraService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carreras")
@CrossOrigin(origins = "http://localhost:4200")
public class CarreraController {

    private final CarreraService carreraService;

    public CarreraController(CarreraService carreraService) {
        this.carreraService = carreraService;
    }

    @GetMapping
    public ResponseEntity<?> listar() {
        return ResponseEntity.ok(carreraService.listar());
    }

    @GetMapping("/coordinadores")
    public ResponseEntity<?> listarCoordinadores() {
        return ResponseEntity.ok(carreraService.listarCoordinadores());
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody CarreraDTO dto) {
        carreraService.crear(dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Integer id, @RequestBody CarreraDTO dto) {
        carreraService.editar(id, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        carreraService.eliminar(id);
        return ResponseEntity.ok().build();
    }
}