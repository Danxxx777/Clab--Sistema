package com.clab.clabbackend.controller;


import com.clab.clabbackend.dto.PerioDTO;
import com.clab.clabbackend.dto.SedeDTO;
import com.clab.clabbackend.entities.PeriodoAcademico;
import com.clab.clabbackend.entities.Sede;
import com.clab.clabbackend.repository.PeriodoAcademicoRepository;
import com.clab.clabbackend.services.PeriodoAcademicoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/periodos")
public class PeriodoAController {
    @Autowired
    private PeriodoAcademicoService periodoAcademicoService;

    @GetMapping("/listar")
    public List<PeriodoAcademico> ListarPeriodos()
    {
        return periodoAcademicoService.listar();
    }

    @PostMapping("/crear")
    public PeriodoAcademico crearPeriodos(@RequestBody PerioDTO dto)
    {
        return periodoAcademicoService.crear(dto);
    }

    @PutMapping("/actualizar/{id}")
    public PeriodoAcademico actualizar(@PathVariable Integer id, @RequestBody PerioDTO dto)
    {
        return periodoAcademicoService.editar(id, dto);
    }

    @DeleteMapping("/eliminar/{id}")
    public void eliminarPeriodoAcademico(@PathVariable Integer id)
    {
        periodoAcademicoService.eliminar(id);
    }

}
