package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.TipoEquipoDTO;
import com.clab.clabbackend.entities.TipoEquipo;
import com.clab.clabbackend.services.TipoEquipoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/tipos-equipo")
public class TipoEquipoController {

    @Autowired
    private TipoEquipoService tipoEquipoService;

    @GetMapping("/listar")
    public List<TipoEquipo> listar() {
        return tipoEquipoService.listar();
    }

    @PostMapping("/crear")
    public TipoEquipo crear(@RequestBody TipoEquipoDTO dto) {
        return tipoEquipoService.crear(dto);
    }

    @PutMapping("/actualizar/{id}")
    public TipoEquipo actualizar(@PathVariable Integer id,
                                 @RequestBody TipoEquipoDTO dto) {
        return tipoEquipoService.actualizar(id, dto);
    }

    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id) {
        tipoEquipoService.eliminar(id);
    }
}
