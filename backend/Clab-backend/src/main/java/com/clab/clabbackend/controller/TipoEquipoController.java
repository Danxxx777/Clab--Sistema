package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.TipoEquipoDTO;
import com.clab.clabbackend.entities.TipoEquipo;
import com.clab.clabbackend.services.TipoEquipoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
//@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/tipos-equipo")
public class TipoEquipoController {

    @Autowired
    private TipoEquipoService tipoEquipoService;

    @GetMapping("/listar")
    public List<TipoEquipo> listar() {
        return tipoEquipoService.listar();
    }

    @PostMapping("/crear")
    public void crear(@RequestBody TipoEquipoDTO dto) {
        tipoEquipoService.crear(dto);
    }

    @PutMapping("/actualizar/{id}")
    public void actualizar(@PathVariable Integer id,
                           @RequestBody TipoEquipoDTO dto) {
        tipoEquipoService.actualizar(id, dto);
    }

    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id) {
        tipoEquipoService.eliminar(id);
    }
}
