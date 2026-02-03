package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.SedeDTO;
import com.clab.clabbackend.entities.Sede;
import com.clab.clabbackend.services.SedeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sedes")
public class SedeController {

    @Autowired
    private SedeService sedeService;

    @GetMapping("/listar")
    public List<Sede> ListarSedes()
    {
        return sedeService.listar();
    }

    @PostMapping("/crear")
    public Sede crearSede(@RequestBody SedeDTO dto)
    {
        return sedeService.crear(dto);
    }

    @PutMapping("/actualizar/{id}")
    public Sede actualizar(@PathVariable Integer id, @RequestBody SedeDTO dto)
    {
        return sedeService.actualizar(id, dto);
    }
}
