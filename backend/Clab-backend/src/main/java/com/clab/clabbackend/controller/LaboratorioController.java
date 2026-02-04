package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.LaboratorioDTO;
import com.clab.clabbackend.entities.Laboratorio;
import com.clab.clabbackend.services.LaboratorioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/laboratorios")
public class LaboratorioController {

    @Autowired
    private LaboratorioService laboratorioService;

    @GetMapping("/listar")
    public List<Laboratorio> listarLaboratorios() {
        return laboratorioService.listar();
    }

    @GetMapping("/obtener/{codLaboratorio}")
    public ResponseEntity<Laboratorio> obtenerPorId(@PathVariable Integer codLaboratorio) {
        return ResponseEntity.ok(laboratorioService.obtenerPorId(codLaboratorio));
    }

    @PostMapping("/crear")
    public Laboratorio crearLaboratorio(@RequestBody LaboratorioDTO dto) {
        return laboratorioService.crear(dto);
    }

    @PutMapping("/actualizar/{codLaboratorio}")
    public Laboratorio actualizarLaboratorio(
            @PathVariable Integer codLaboratorio,
            @RequestBody LaboratorioDTO dto) {
        return laboratorioService.actualizar(codLaboratorio, dto);
    }

    @DeleteMapping("/eliminar/{codLaboratorio}")
    public ResponseEntity<String> eliminarLaboratorio(@PathVariable Integer codLaboratorio) {
        laboratorioService.eliminar(codLaboratorio);
        return ResponseEntity.ok("Laboratorio eliminado exitosamente");
    }
}