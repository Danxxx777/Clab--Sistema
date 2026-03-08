package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.TipoEquipoDTO;
import com.clab.clabbackend.entities.TipoEquipo;
import com.clab.clabbackend.services.TipoEquipoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tipos-equipo")
public class TipoEquipoController {

    @Autowired
    private TipoEquipoService tipoEquipoService;

    // Lista todos los tipos de equipo
    @GetMapping("/listar")
    public List<TipoEquipo> listar() {
        return tipoEquipoService.listar();
    }

    // Crea un nuevo tipo de equipo
    @PostMapping("/crear")
    public void crear(@RequestBody TipoEquipoDTO dto) {
        tipoEquipoService.crear(dto);
    }

    // Actualiza un tipo de equipo existente por su ID
    @PutMapping("/actualizar/{id}")
    public void actualizar(
            @PathVariable Integer id,
            @RequestBody TipoEquipoDTO dto) {

        tipoEquipoService.actualizar(id, dto);
    }

    // Elimina un tipo de equipo por su ID
    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id) {
        tipoEquipoService.eliminar(id);
    }
}