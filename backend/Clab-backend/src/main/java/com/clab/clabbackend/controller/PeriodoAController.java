package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.PerioDTO;
import com.clab.clabbackend.entities.PeriodoAcademico;
import com.clab.clabbackend.services.PeriodoAcademicoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/periodos")
public class PeriodoAController {

    @Autowired
    private PeriodoAcademicoService periodoAcademicoService;

    // Lista todos los períodos académicos
    @GetMapping("/listar")
    public List<PeriodoAcademico> listarPeriodos() {
        return periodoAcademicoService.listar();
    }

    // Crea un nuevo período académico
    @PostMapping("/crear")
    public PeriodoAcademico crearPeriodos(@RequestBody PerioDTO dto) {
        return periodoAcademicoService.crear(dto);
    }

    // Actualiza un período académico existente por su ID
    @PutMapping("/actualizar/{id}")
    public PeriodoAcademico actualizar(
            @PathVariable Integer id,
            @RequestBody PerioDTO dto) {
        return periodoAcademicoService.editar(id, dto);
    }

    // Elimina un período académico por su ID
    @DeleteMapping("/eliminar/{id}")
    public void eliminarPeriodoAcademico(@PathVariable Integer id) {
        periodoAcademicoService.eliminar(id);
    }
}