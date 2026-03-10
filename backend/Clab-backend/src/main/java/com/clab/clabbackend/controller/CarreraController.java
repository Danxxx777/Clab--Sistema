package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.CarreraDTO;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.AuditoriaService;
import com.clab.clabbackend.services.CarreraService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carreras")
public class CarreraController {

    private final CarreraService carreraService;
    private final JwtService jwtService;
    private final AuditoriaService auditoriaService;

    public CarreraController(CarreraService carreraService,
                             JwtService jwtService,
                             AuditoriaService auditoriaService) {
        this.carreraService   = carreraService;
        this.jwtService       = jwtService;
        this.auditoriaService = auditoriaService;
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
    public ResponseEntity<?> listar() {
        return ResponseEntity.ok(carreraService.listar());
    }

    @GetMapping("/coordinadores")
    public ResponseEntity<?> listarCoordinadores() {
        return ResponseEntity.ok(carreraService.listarCoordinadores());
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody CarreraDTO dto, HttpServletRequest request) {
        carreraService.crear(dto, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Integer id,
                                    @RequestBody CarreraDTO dto,
                                    HttpServletRequest request) {
        carreraService.editar(id, dto, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id, HttpServletRequest request) {
        carreraService.eliminar(id, obtenerIdUsuario(request), obtenerUsuario(request));
        return ResponseEntity.ok().build();
    }
}
