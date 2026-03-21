package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.EquipoDTO;
import com.clab.clabbackend.entities.Equipo;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.AuditoriaService;
import com.clab.clabbackend.services.EquipoService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/equipos")
@RequiredArgsConstructor
public class EquipoController {

    private final EquipoService equipoService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuditoriaService auditoriaService;

    // ─── HELPERS JWT ─────────────────────────────────────────────────────────

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
                Object usuarioObj = claims.get("usuario");
                if (usuarioObj != null) return usuarioObj.toString();
                Object subObj = claims.get("sub");
                if (subObj != null) return subObj.toString();
            }
        } catch (Exception ignored) {}
        return "desconocido";
    }

    // ─── ENDPOINTS ───────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<Equipo>> listar() {
        return ResponseEntity.ok(equipoService.listar());
    }

    @GetMapping("/porEncargado/{idUsuario}")
    public ResponseEntity<List<Equipo>> equiposPorEncargado(@PathVariable Integer idUsuario) {
        return ResponseEntity.ok(equipoService.equiposPorEncargado(idUsuario));
    }

    @GetMapping("/porLaboratorio/{codLaboratorio}")
    public ResponseEntity<List<Equipo>> equiposPorLaboratorio(@PathVariable Integer codLaboratorio) {
        return ResponseEntity.ok(equipoService.equiposPorLaboratorio(codLaboratorio));
    }

    @PostMapping
    public ResponseEntity<Void> crear(@RequestBody EquipoDTO dto, HttpServletRequest request) {
        equipoService.crear(dto, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> editar(@PathVariable Integer id,
                                       @RequestBody EquipoDTO dto,
                                       HttpServletRequest request) {
        equipoService.editar(id, dto, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id, HttpServletRequest request) {
        equipoService.eliminar(id, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.noContent().build();
    }
}