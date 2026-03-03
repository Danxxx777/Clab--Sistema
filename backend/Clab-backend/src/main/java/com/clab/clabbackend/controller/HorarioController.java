package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.HorarioDTO;
import com.clab.clabbackend.services.HorarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/horarios")
@RequiredArgsConstructor
public class HorarioController {

    // Servicio que contiene la lógica de negocio
    private final HorarioService horarioService;

    // Lista todos los horarios
    @GetMapping
    public ResponseEntity<?> listar() {
        return ResponseEntity.ok(horarioService.listar());
    }

    // Lista los docentes disponibles para asignar horarios
    @GetMapping("/docentes")
    public ResponseEntity<?> listarDocentes() {
        return ResponseEntity.ok(horarioService.listarDocentes());
    }

    // Crea un nuevo horario
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody HorarioDTO dto) {
        horarioService.crear(dto);
        return ResponseEntity.ok().build();
    }

    // Edita un horario existente por su ID
    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Integer id, @RequestBody HorarioDTO dto) {
        horarioService.editar(id, dto);
        return ResponseEntity.ok().build();
    }

    // Elimina un horario por su ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        horarioService.eliminar(id);
        return ResponseEntity.ok().build();
    }

    // Lista los horarios asociados a una asignatura específica
    @GetMapping("/asignatura/{idAsignatura}")
    public ResponseEntity<?> listarPorAsignatura(@PathVariable Integer idAsignatura) {
        return ResponseEntity.ok(horarioService.listarPorAsignatura(idAsignatura));
    }
}