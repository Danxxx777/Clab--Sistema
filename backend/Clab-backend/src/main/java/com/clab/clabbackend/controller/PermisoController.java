package com.clab.clabbackend.controller;

import com.clab.clabbackend.entities.Permiso;
import com.clab.clabbackend.repository.PermisoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permisos")
@CrossOrigin
public class PermisoController {

    // Repositorio para acceder a la base de datos
    private final PermisoRepository permisoRepository;

    // Constructor para inyectar el repositorio
    public PermisoController(PermisoRepository permisoRepository) {
        this.permisoRepository = permisoRepository;
    }

    // Lista todos los permisos registrados
    @GetMapping
    public List<Permiso> listar() {
        return permisoRepository.findAll();
    }
}