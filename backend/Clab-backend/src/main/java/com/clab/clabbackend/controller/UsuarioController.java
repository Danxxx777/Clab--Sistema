package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.UsuarioRequestDTO;
import com.clab.clabbackend.dto.UsuarioResponseDTO;
import com.clab.clabbackend.services.PermisoService;
import com.clab.clabbackend.services.UsuarioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "http://localhost:4200")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final PermisoService permisoService;

    public UsuarioController(
            UsuarioService usuarioService,
            PermisoService permisoService
    ) {
        this.usuarioService = usuarioService;
        this.permisoService = permisoService;
    }

    @PostMapping("/crear")
    public UsuarioResponseDTO crear(@RequestBody UsuarioRequestDTO dto) {
        return usuarioService.crear(dto);
    }


    @GetMapping("/listar")
    public List<UsuarioResponseDTO> listar() {
        return usuarioService.listar();
    }

    @PutMapping("/desactivar/{id}")
    public void desactivar(@PathVariable Integer id) {
        usuarioService.desactivar(id);
    }

    @PutMapping("/actualizar/{id}")
    public UsuarioResponseDTO actualizar(
            @PathVariable Integer id,
            @RequestBody UsuarioRequestDTO dto
    ) {
        return usuarioService.actualizar(id, dto);
    }

}