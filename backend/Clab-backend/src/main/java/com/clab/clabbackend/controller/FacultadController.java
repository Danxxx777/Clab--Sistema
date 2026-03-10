package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.DecanoResponseDTO;
import com.clab.clabbackend.dto.FacultadDTO;
import com.clab.clabbackend.dto.FacultadResponseDTO;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.AuditoriaService;
import com.clab.clabbackend.services.FacultadService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/facultades")
@RequiredArgsConstructor
public class FacultadController {

    private final FacultadService facultadService;
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
    public ResponseEntity<List<FacultadResponseDTO>> listar() {
        return ResponseEntity.ok(facultadService.listar());
    }

    @GetMapping("/decanos")
    public ResponseEntity<List<DecanoResponseDTO>> listarDecanos() {
        return ResponseEntity.ok(facultadService.listarDecanos());
    }

    @PostMapping
    public ResponseEntity<Void> crear(@RequestBody FacultadDTO dto, HttpServletRequest request) {
        facultadService.crear(dto, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> editar(@PathVariable Integer id,
                                       @RequestBody FacultadDTO dto,
                                       HttpServletRequest request) {
        facultadService.editar(id, dto, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id, HttpServletRequest request) {
        facultadService.eliminar(id, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.noContent().build();
    }
}
