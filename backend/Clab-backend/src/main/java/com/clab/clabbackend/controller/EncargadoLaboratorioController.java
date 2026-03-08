package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.EncargadoLaboratorioDTO;
import com.clab.clabbackend.services.EncargadoLaboratorioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/encargados-laboratorios")
@RequiredArgsConstructor
public class EncargadoLaboratorioController {

    private final EncargadoLaboratorioService encargadoLaboratorioService;

    @GetMapping("listar")
    public ResponseEntity<List<Map<String, Object>>> listar() {
        return ResponseEntity.ok(encargadoLaboratorioService.listarEncargados());
    }

    @GetMapping("/listarRolEncargados")
    public ResponseEntity<?> listarDocentes() {
        return ResponseEntity.ok(encargadoLaboratorioService.listarRolEncargados());
    }

    @GetMapping("/listarLaboratorios")
    public ResponseEntity<?> listarLaboratorios() {
        return ResponseEntity.ok(encargadoLaboratorioService.listarLaboratorios());
    }

    @PostMapping("/crear")
    public ResponseEntity<Void> insertar(@RequestBody EncargadoLaboratorioDTO dto) {
        encargadoLaboratorioService.insertarEncargado(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Void> actualizar(
            @PathVariable Integer id,
            @RequestBody EncargadoLaboratorioDTO dto) {
        dto.setIdEncargadoLaboratorio(id);
        encargadoLaboratorioService.actualizarEncargado(dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        encargadoLaboratorioService.eliminarEncargado(id);
        return ResponseEntity.noContent().build();
    }
}
