package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.UsuarioDTO;
import com.clab.clabbackend.dto.UsuarioResponseDTO;
import com.clab.clabbackend.entities.Usuario;
import com.clab.clabbackend.services.UsuarioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "http://localhost:4200")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/crear")
    public Usuario crear(@RequestBody UsuarioDTO dto) {
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
    public Usuario actualizar(@PathVariable Integer id, @RequestBody UsuarioDTO dto) {
        return usuarioService.actualizar(id, dto);
    }

}
