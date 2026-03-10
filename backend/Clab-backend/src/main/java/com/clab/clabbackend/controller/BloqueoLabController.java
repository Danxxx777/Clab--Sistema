package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.BloqueoLabDTO;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.BloqueoLabService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bloqueos")
public class BloqueoLabController {

    private final BloqueoLabService bloqueoLabService;
    private final JwtService jwtService;

    public BloqueoLabController(BloqueoLabService bloqueoLabService, JwtService jwtService) {
        this.bloqueoLabService = bloqueoLabService;
        this.jwtService = jwtService;
    }

    private Integer obtenerIdUsuario(HttpServletRequest request) {
        try {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                Claims claims = jwtService.obtenerClaims(header.substring(7));
                Object idObj = claims.get("idUsuario");
                if (idObj != null) return Integer.parseInt(idObj.toString());
                return Integer.parseInt(claims.getSubject());
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String obtenerUsuario(HttpServletRequest request) {
        try {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                Claims claims = jwtService.obtenerClaims(header.substring(7));
                Object u = claims.get("usuario");
                if (u != null) return u.toString();
                Object s = claims.get("sub");
                if (s != null) return s.toString();
            }
        } catch (Exception ignored) {}
        return "desconocido";
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listar() {
        return ResponseEntity.ok(bloqueoLabService.listar());
    }

    @PostMapping
    public ResponseEntity<Void> crear(@RequestBody BloqueoLabDTO dto, HttpServletRequest request) {
        bloqueoLabService.crear(dto, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> actualizar(@PathVariable Integer id,
                                           @RequestBody BloqueoLabDTO dto,
                                           HttpServletRequest request) {
        bloqueoLabService.actualizar(id, dto, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id, HttpServletRequest request) {
        bloqueoLabService.eliminar(id, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }
}