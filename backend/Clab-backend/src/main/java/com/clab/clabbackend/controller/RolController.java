package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.RolBDDTO;
import com.clab.clabbackend.dto.RolRequestDTO;
import com.clab.clabbackend.dto.RolResponseDTO;
import com.clab.clabbackend.entities.Rol;
import com.clab.clabbackend.services.RolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/roles")
public class RolController {

    @Autowired
    private RolService rolService;

    // Lista todos los roles
    @GetMapping("/listar")
    public List<RolResponseDTO> listar() {
        return rolService.listar();
    }

    // Crea un nuevo rol
    @PostMapping("/crear")
    public Rol crear(@RequestBody RolRequestDTO dto) {
        return rolService.crear(dto);
    }

    // Actualiza un rol existente por su ID
    @PutMapping("/actualizar/{id}")
    public Rol actualizar(
            @PathVariable Integer id,
            @RequestBody RolRequestDTO dto) {
        return rolService.actualizar(id, dto);
    }

    // Elimina un rol por su ID
    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id) {
        rolService.eliminar(id);
    }

    // Obtiene los permisos activos asociados a un rol
    @GetMapping("/{id}/permisos")
    public List<Integer> obtenerPermisos(@PathVariable Integer id) {
        return rolService.obtenerPermisosActivos(id);
    }

    // Lista los roles existentes en la base de datos
    @GetMapping("/roles-bd")
    public List<RolBDDTO> listarRolesBD() {
        return rolService.listarRolesBD();
    }

    // Cambia el estado (ACTIVO/INACTIVO) de un rol
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        try {
            String estado = body.get("estado");
            rolService.cambiarEstado(id, estado);
            return ResponseEntity.ok(Map.of("mensaje", "Estado actualizado a " + estado));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}