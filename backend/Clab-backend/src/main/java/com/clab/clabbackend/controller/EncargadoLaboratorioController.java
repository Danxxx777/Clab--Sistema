package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.EncargadoLaboratorioDTO;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.AuditoriaService;
import com.clab.clabbackend.services.EncargadoLaboratorioService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/encargados-laboratorios")
@RequiredArgsConstructor
public class EncargadoLaboratorioController {

    private final EncargadoLaboratorioService encargadoLaboratorioService;
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

    @GetMapping("listar")
    public ResponseEntity<List<Map<String, Object>>> listar() {
        return ResponseEntity.ok(encargadoLaboratorioService.listarEncargados());
    }

    @GetMapping("/listarRolEncargados")
    public ResponseEntity<?> listarDocentes() {
        return ResponseEntity.ok(encargadoLaboratorioService.listarRolEncargados());
    }

    @GetMapping("/listarLaboratorios")
    public ResponseEntity<?> listarLaboratorios() {
        return ResponseEntity.ok(encargadoLaboratorioService.listarLaboratorios());
    }

    @PostMapping("/crear")
    public ResponseEntity<Void> insertar(@RequestBody EncargadoLaboratorioDTO dto,
                                         HttpServletRequest request) {
        encargadoLaboratorioService.insertarEncargado(dto,
                obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Void> actualizar(@PathVariable Integer id,
                                           @RequestBody EncargadoLaboratorioDTO dto,
                                           HttpServletRequest request) {
        dto.setIdEncargadoLaboratorio(id);
        encargadoLaboratorioService.actualizarEncargado(dto,
                obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id,
                                         HttpServletRequest request) {
        encargadoLaboratorioService.eliminarEncargado(id,
                obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.noContent().build();
    }
}