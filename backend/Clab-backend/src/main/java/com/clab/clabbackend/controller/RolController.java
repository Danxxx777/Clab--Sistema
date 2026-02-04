package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.RolDTO;
import com.clab.clabbackend.entities.Rol;
import com.clab.clabbackend.services.RolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@CrossOrigin(origins = "http://localhost:4200")
public class RolController {

    @Autowired
    private RolService rolService;

    @GetMapping("/listar")
    public List<Rol> listar() {
        return rolService.listar();
    }

    @PostMapping("/crear")
    public Rol crear(@RequestBody RolDTO dto) {
        return rolService.crear(dto);
    }

    @PutMapping("/actualizar/{id}")
    public Rol actualizar(@PathVariable Integer id, @RequestBody RolDTO dto) {
        return rolService.actualizar(id, dto);
    }

    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id) {
        rolService.eliminar(id);
    }
}
