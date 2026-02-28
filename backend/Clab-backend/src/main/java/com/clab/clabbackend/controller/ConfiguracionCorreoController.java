package com.clab.clabbackend.controller;

import com.clab.clabbackend.entities.ConfiguracionCorreo;
import com.clab.clabbackend.services.ConfiguracionCorreoService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/configuracion/correo")
@CrossOrigin(origins = "http://localhost:4200")
public class ConfiguracionCorreoController {

    private final ConfiguracionCorreoService service;

    public ConfiguracionCorreoController(ConfiguracionCorreoService service) {
        this.service = service;
    }

    @GetMapping
    public ConfiguracionCorreo obtener() {
        return service.obtener();
    }

    @PostMapping
    public ConfiguracionCorreo crear(@RequestBody ConfiguracionCorreo config) {
        return service.guardar(config);
    }

    @PutMapping("/{id}")
    public ConfiguracionCorreo actualizar(@PathVariable Integer id,
                                          @RequestBody ConfiguracionCorreo config) {
        return service.actualizar(id, config);
    }
}