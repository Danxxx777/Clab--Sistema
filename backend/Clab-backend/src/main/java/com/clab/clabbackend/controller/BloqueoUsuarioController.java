package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.BloqueoUsuarioDTO;
import com.clab.clabbackend.services.BloqueoUsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bloqueo-usuario")
public class BloqueoUsuarioController {

    private final BloqueoUsuarioService bloqueoUsuarioService;

    public BloqueoUsuarioController(BloqueoUsuarioService bloqueoUsuarioService) {
        this.bloqueoUsuarioService = bloqueoUsuarioService;
    }

    @GetMapping("/listar")
    public ResponseEntity<List<Map<String, Object>>> listarBloqueados() {
        return ResponseEntity.ok(bloqueoUsuarioService.listarBloqueados());
    }

    @PutMapping("/desbloquear")
    public ResponseEntity<Void> desbloquearUsuario(@RequestBody BloqueoUsuarioDTO dto) {
        bloqueoUsuarioService.desbloquearUsuario(dto.getIdUsuario());
        return ResponseEntity.ok().build();
    }
}