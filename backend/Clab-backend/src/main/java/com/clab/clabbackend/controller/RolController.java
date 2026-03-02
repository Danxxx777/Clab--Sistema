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
@CrossOrigin(origins = "http://localhost:4200")
public class RolController {

    @Autowired
    private RolService rolService;

    @GetMapping("/listar")
    public List<RolResponseDTO> listar() {
        return rolService.listar();
    }

    @PostMapping("/crear")
    public Rol crear(@RequestBody RolRequestDTO dto) {
        return rolService.crear(dto);
    }

    @PutMapping("/actualizar/{id}")
    public Rol actualizar(@PathVariable Integer id,
                          @RequestBody RolRequestDTO dto) {
        return rolService.actualizar(id, dto);
    }

    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id) {
        rolService.eliminar(id);
    }

    @GetMapping("/{id}/permisos")
    public List<Integer> obtenerPermisos(@PathVariable Integer id) {
        return rolService.obtenerPermisosActivos(id);
    }

    @GetMapping("/roles-bd")
    public List<RolBDDTO> listarRolesBD() {
        return rolService.listarRolesBD();
    }

    // 👈 Nuevo endpoint para cambiar estado
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
// a ver