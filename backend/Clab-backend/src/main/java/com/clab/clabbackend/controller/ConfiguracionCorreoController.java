package com.clab.clabbackend.controller;

import com.clab.clabbackend.entities.ConfiguracionCorreo;
import com.clab.clabbackend.services.ConfiguracionCorreoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/configuracion-correo")
@RequiredArgsConstructor
public class ConfiguracionCorreoController {

    private final ConfiguracionCorreoService service;

    @GetMapping
    public ResponseEntity<List<ConfiguracionCorreo>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @PostMapping
    public ResponseEntity<ConfiguracionCorreo> crear(@RequestBody ConfiguracionCorreo config) {
        return ResponseEntity.ok(service.crear(config));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConfiguracionCorreo> actualizar(
            @PathVariable Integer id,
            @RequestBody ConfiguracionCorreo config) {
        return ResponseEntity.ok(service.actualizar(id, config));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ConfiguracionCorreo> cambiarEstado(
            @PathVariable Integer id,
            @RequestParam Boolean activo) {
        return ResponseEntity.ok(service.cambiarEstado(id, activo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        service.eliminar(id);
        return ResponseEntity.ok().build();
    }

    // ✅ Probar configuración SMTP — envía correo de prueba al remitente
    @PostMapping("/{id}/probar")
    public ResponseEntity<?> probar(@PathVariable Integer id) {
        try {
            service.probar(id);
            return ResponseEntity.ok(Map.of("mensaje", "Correo de prueba enviado correctamente."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ Obtener presets de proveedores conocidos
    @GetMapping("/presets")
    public ResponseEntity<List<Map<String, Object>>> presets() {
        return ResponseEntity.ok(service.obtenerPresets());
    }
}