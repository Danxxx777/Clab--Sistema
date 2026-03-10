package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.CancelacionDTO;
import com.clab.clabbackend.dto.ReservaDTO;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.AuditoriaService;
import com.clab.clabbackend.services.ReservaService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;
    private final JwtService jwtService;
    private final AuditoriaService auditoriaService;

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

    @GetMapping("/listar")
    public ResponseEntity<List<Map<String, Object>>> listar() {
        return ResponseEntity.ok(reservaService.listar());
    }

    @GetMapping("/usuario/{id}")
    public ResponseEntity<List<Map<String, Object>>> listarPorUsuario(@PathVariable Integer id) {
        return ResponseEntity.ok(reservaService.listarPorUsuario(id));
    }

    @GetMapping("/listarPorEncargado/{idUsuario}")
    public ResponseEntity<List<Map<String, Object>>> listarPorEncargado(@PathVariable Integer idUsuario) {
        return ResponseEntity.ok(reservaService.listarPorEncargado(idUsuario));
    }

    @PostMapping("/crear")
    public ResponseEntity<Void> crear(@RequestBody ReservaDTO dto, HttpServletRequest request) {
        reservaService.crear(dto, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/crear-admin")
    public ResponseEntity<Void> crearAdmin(@RequestBody ReservaDTO dto, HttpServletRequest request) {
        reservaService.crearAdmin(dto, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Void> actualizar(@PathVariable Integer id,
                                           @RequestBody ReservaDTO dto,
                                           HttpServletRequest request) {
        reservaService.actualizar(id, dto, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/cancelar")
    public ResponseEntity<Void> cancelar(@RequestBody CancelacionDTO dto, HttpServletRequest request) {
        reservaService.cancelar(dto, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/aprobar/{id}")
    public ResponseEntity<Void> aprobar(@PathVariable Integer id, HttpServletRequest request) {
        reservaService.aprobar(id, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/rechazar/{id}")
    public ResponseEntity<Void> rechazar(@PathVariable Integer id, HttpServletRequest request) {
        reservaService.rechazar(id, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }
}