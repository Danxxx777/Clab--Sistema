package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.AsignaturaDTO;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.AuditoriaService;
import com.clab.clabbackend.services.AsignaturaService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/asignaturas")
@RequiredArgsConstructor
public class AsignaturaController {

    private final AsignaturaService asignaturaService;
    private final JwtService jwtService;
    private final AuditoriaService auditoriaService;

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
    public ResponseEntity<?> listar() {
        return ResponseEntity.ok(asignaturaService.listar());
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody AsignaturaDTO dto, HttpServletRequest request) {
        asignaturaService.crear(dto, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Integer id,
                                    @RequestBody AsignaturaDTO dto,
                                    HttpServletRequest request) {
        asignaturaService.editar(id, dto, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id, HttpServletRequest request) {
        asignaturaService.eliminar(id, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }
}