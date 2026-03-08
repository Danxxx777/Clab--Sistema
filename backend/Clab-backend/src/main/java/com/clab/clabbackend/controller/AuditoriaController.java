package com.clab.clabbackend.controller;

import com.clab.clabbackend.entities.Auditoria;
import com.clab.clabbackend.entities.SesionActiva;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.AuditoriaService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auditoria")
public class AuditoriaController {

    private final AuditoriaService auditoriaService;
    private final JwtService jwtService;

    public AuditoriaController(AuditoriaService auditoriaService, JwtService jwtService) {
        this.auditoriaService = auditoriaService;
        this.jwtService = jwtService;
    }

    // ─── HELPERS JWT ─────────────────────────────────────────────────────────
    private Integer obtenerIdUsuario(HttpServletRequest request) {
        try {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                Claims claims = jwtService.obtenerClaims(header.substring(7));
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
            }
        } catch (Exception ignored) {}
        return "desconocido";
    }

    // ─── ENDPOINTS ───────────────────────────────────────────────────────────
    @GetMapping("/listar")
    public ResponseEntity<List<Auditoria>> listar() {
        return ResponseEntity.ok(auditoriaService.listarTodo());
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Auditoria>> listarPorUsuario(@PathVariable Integer idUsuario) {
        return ResponseEntity.ok(auditoriaService.listarPorUsuario(idUsuario));
    }

    @GetMapping("/modulo/{modulo}")
    public ResponseEntity<List<Auditoria>> listarPorModulo(@PathVariable String modulo) {
        return ResponseEntity.ok(auditoriaService.listarPorModulo(modulo));
    }

    @GetMapping("/sesiones-activas")
    public ResponseEntity<List<SesionActiva>> sesionesActivas() {
        return ResponseEntity.ok(auditoriaService.listarSesionesActivas());
    }

    @PostMapping("/forzar-logout/{idUsuario}")
    public ResponseEntity<?> forzarLogout(@PathVariable Integer idUsuario,
                                          HttpServletRequest request) {
        try {
            auditoriaService.forzarLogout(idUsuario, obtenerIdUsuario(request), obtenerUsuario(request), auditoriaService.obtenerIp(request));
            return ResponseEntity.ok(Map.of("mensaje", "Sesión cerrada correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}