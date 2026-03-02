package com.clab.clabbackend.controller;

import com.clab.clabbackend.entities.ConfiguracionCorreo;
import com.clab.clabbackend.services.ConfiguracionCorreoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/configuracion/correo")
@CrossOrigin(origins = "http://localhost:4200")
public class ConfiguracionCorreoController {

    private final ConfiguracionCorreoService service;

    public ConfiguracionCorreoController(ConfiguracionCorreoService service) {
        this.service = service;
    }

    // Listar todos
    @GetMapping("/listar")
    public List<ConfiguracionCorreo> listar() {
        return service.listar();
    }

    // Obtener por propósito (para compatibilidad con dashboard)
    @GetMapping
    public ConfiguracionCorreo obtener() {
        return service.obtenerPorProposito("GENERAL");
    }

    // Crear nuevo
    @PostMapping
    public ConfiguracionCorreo crear(@RequestBody ConfiguracionCorreo config) {
        return service.crear(config);
    }

    // Actualizar
    @PutMapping("/{id}")
    public ConfiguracionCorreo actualizar(@PathVariable Integer id,
                                          @RequestBody ConfiguracionCorreo config) {
        return service.actualizar(id, config);
    }

    // Cambiar estado activo/inactivo
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Integer id,
                                           @RequestBody Map<String, Boolean> body) {
        try {
            Boolean activo = body.get("activo");
            return ResponseEntity.ok(service.cambiarEstado(id, activo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Eliminar
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            service.eliminar(id);
            return ResponseEntity.ok(Map.of("mensaje", "Configuración eliminada"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}