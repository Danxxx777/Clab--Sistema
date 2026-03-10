package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.TipoBloqueoDTO;
import com.clab.clabbackend.entities.TipoBloqueo;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.TipoBloqueoService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tipos-bloqueos")
@RequiredArgsConstructor
public class TipoBloqueoController {

    private final TipoBloqueoService tipoBloqueoService;
    private final JwtService jwtService;

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

    @GetMapping("/listar")
    public ResponseEntity<List<TipoBloqueo>> listar() {
        return ResponseEntity.ok(tipoBloqueoService.listar());
    }

    @PostMapping("/crear")
    public ResponseEntity<Void> crear(@RequestBody TipoBloqueoDTO dto, HttpServletRequest request) {
        tipoBloqueoService.crear(dto, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Void> actualizar(@PathVariable Integer id,
                                           @RequestBody TipoBloqueoDTO dto,
                                           HttpServletRequest request) {
        tipoBloqueoService.actualizar(id, dto, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id, HttpServletRequest request) {
        tipoBloqueoService.eliminar(id, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.noContent().build();
    }
}