package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.ReporteFallasDTO;
import com.clab.clabbackend.entities.ReporteFallas;
import com.clab.clabbackend.services.ReporteFallasService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/reportes")
public class ReporteFallasController {

    @Autowired
    private ReporteFallasService reporteService;

    @GetMapping("/listar")
    public List<ReporteFallas> listar() {
        return reporteService.listar();
    }

    @PostMapping("/crear")
    public ReporteFallas crear(@RequestBody ReporteFallasDTO dto) {
        return reporteService.crear(dto);
    }

    @DeleteMapping("/eliminar/{id}")
    public String eliminar(@PathVariable Integer id) {
        reporteService.eliminar(id);
        return "Reporte eliminado correctamente";
    }
}
