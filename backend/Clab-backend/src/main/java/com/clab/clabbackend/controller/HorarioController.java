package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.HorarioDTO;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.AuditoriaService;
import com.clab.clabbackend.services.HorarioService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/horarios")
@RequiredArgsConstructor
public class HorarioController {

    private final HorarioService horarioService;
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
        return ResponseEntity.ok(horarioService.listar());
    }

    @GetMapping("/docentes")
    public ResponseEntity<?> listarDocentes() {
        return ResponseEntity.ok(horarioService.listarDocentes());
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody HorarioDTO dto, HttpServletRequest request) {
        horarioService.crear(dto, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Integer id,
                                    @RequestBody HorarioDTO dto,
                                    HttpServletRequest request) {
        horarioService.editar(id, dto, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id, HttpServletRequest request) {
        horarioService.eliminar(id, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/asignatura/{idAsignatura}")
    public ResponseEntity<?> listarPorAsignatura(@PathVariable Integer idAsignatura) {
        return ResponseEntity.ok(horarioService.listarPorAsignatura(idAsignatura));
    }
}