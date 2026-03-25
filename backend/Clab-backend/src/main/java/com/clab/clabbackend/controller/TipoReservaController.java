package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.TipoReservaDTO;
import com.clab.clabbackend.entities.TipoReserva;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.AuditoriaService;
import com.clab.clabbackend.services.TipoReservaService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tipos-reserva")
@RequiredArgsConstructor
public class TipoReservaController {

    private final TipoReservaService tipoReservaService;
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
    public ResponseEntity<?> listar() {
        try {
            return ResponseEntity.ok(tipoReservaService.listar());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/crear")
    public ResponseEntity<?> crear(@RequestBody TipoReservaDTO dto, HttpServletRequest request) {
        try {
            System.out.println("=== CREAR TIPO RESERVA ===");
            System.out.println("DTO recibido: " + dto.getNombreTipo() + " / " + dto.getDescripcion() + " / " + dto.getRequiereAsignatura());
            tipoReservaService.crear(dto, obtenerIdUsuario(request), obtenerUsuario(request));
            System.out.println("=== CREADO OK ===");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.out.println("=== ERROR AL CREAR: " + e.getMessage() + " ===");
            e.printStackTrace();
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }


    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Void> actualizar(@PathVariable Integer id,
                                           @RequestBody TipoReservaDTO dto,
                                           HttpServletRequest request) {
        tipoReservaService.actualizar(id, dto, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id, HttpServletRequest request) {
        tipoReservaService.eliminar(id, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.noContent().build();
    }
}