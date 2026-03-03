package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.UsuarioRequestDTO;
import com.clab.clabbackend.dto.UsuarioResponseDTO;
import com.clab.clabbackend.services.PermisoService;
import com.clab.clabbackend.services.UsuarioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final PermisoService permisoService;

    // Constructor para inyección de dependencias
    public UsuarioController(
            UsuarioService usuarioService,
            PermisoService permisoService
    ) {
        this.usuarioService = usuarioService;
        this.permisoService = permisoService;
    }

    // Crea un nuevo usuario
    @PostMapping("/crear")
    public UsuarioResponseDTO crear(@RequestBody UsuarioRequestDTO dto) {
        return usuarioService.crear(dto);
    }

    // Lista todos los usuarios
    @GetMapping("/listar")
    public List<UsuarioResponseDTO> listar() {
        return usuarioService.listar();
    }

    // Desactiva un usuario por su ID
    @PutMapping("/desactivar/{id}")
    public void desactivar(@PathVariable Integer id) {
        usuarioService.desactivar(id);
    }

    // Actualiza un usuario existente por su ID
    @PutMapping("/actualizar/{id}")
    public UsuarioResponseDTO actualizar(
            @PathVariable Integer id,
            @RequestBody UsuarioRequestDTO dto) {

        return usuarioService.actualizar(id, dto);
    }
}