package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.RolRequestDTO;
import com.clab.clabbackend.dto.RolResponseDTO;
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
    public List<String> listarRolesBD() {
        return rolService.listarRolesBD();
    }
}
