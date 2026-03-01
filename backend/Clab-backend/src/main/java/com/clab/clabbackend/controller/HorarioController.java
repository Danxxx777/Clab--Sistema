package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.HorarioDTO;
import com.clab.clabbackend.services.HorarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/horarios")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class HorarioController {

    private final HorarioService horarioService;

    @GetMapping
    public ResponseEntity<?> listar() {
        return ResponseEntity.ok(horarioService.listar());
    }

    @GetMapping("/docentes")
    public ResponseEntity<?> listarDocentes() {
        return ResponseEntity.ok(horarioService.listarDocentes());
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody HorarioDTO dto) {
        horarioService.crear(dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Integer id, @RequestBody HorarioDTO dto) {
        horarioService.editar(id, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        horarioService.eliminar(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/asignatura/{idAsignatura}")
    public ResponseEntity<?> listarPorAsignatura(@PathVariable Integer idAsignatura) {
        return ResponseEntity.ok(horarioService.listarPorAsignatura(idAsignatura));
    }
}