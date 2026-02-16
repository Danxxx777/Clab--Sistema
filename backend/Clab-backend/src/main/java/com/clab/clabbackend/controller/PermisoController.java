package com.clab.clabbackend.controller;

import com.clab.clabbackend.entities.Permiso;
import com.clab.clabbackend.repository.PermisoRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/permisos")
@CrossOrigin
public class PermisoController {

    private final PermisoRepository permisoRepository;

    public PermisoController(PermisoRepository permisoRepository) {
        this.permisoRepository = permisoRepository;
    }

    @GetMapping
    public List<Permiso> listar() {
        return permisoRepository.findAll();
    }
}


