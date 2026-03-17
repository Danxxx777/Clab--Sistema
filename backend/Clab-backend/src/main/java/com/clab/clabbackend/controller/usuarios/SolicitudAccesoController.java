package com.clab.clabbackend.controller.usuarios;

import com.clab.clabbackend.dto.usuarios.SolicitudAccesoDTO;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.usuarios.SolicitudAccesoService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/solicitudes")
@RequiredArgsConstructor
public class SolicitudAccesoController {

    private final SolicitudAccesoService service;
    private final JwtService jwtService;

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

    // PÚBLICO
    @PostMapping("/crear")
    public ResponseEntity<Map<String, Object>> crear(@RequestBody SolicitudAccesoDTO dto) {
        return ResponseEntity.ok(service.crearSolicitud(dto));
    }

    // PROTEGIDOS
    @GetMapping("/pendientes")
    public ResponseEntity<List<SolicitudAccesoDTO>> pendientes() {
        return ResponseEntity.ok(service.listarPendientes());
    }

    @GetMapping("/todas")
    public ResponseEntity<List<SolicitudAccesoDTO>> todas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/pendientes/count")
    public ResponseEntity<Map<String, Long>> contarPendientes() {
        return ResponseEntity.ok(Map.of("count", service.contarPendientes()));
    }

    @PostMapping("/aprobar/{id}")
    public ResponseEntity<Map<String, Object>> aprobar(@PathVariable Integer id, HttpServletRequest request, @RequestBody Map<String, List<Integer>> body) {
        Integer idAdmin = obtenerIdUsuario(request);
        return ResponseEntity.ok(service.aprobarSolicitud(id, idAdmin, body.get("roles")));
    }

    @PostMapping("/rechazar/{id}")
    public ResponseEntity<Map<String, Object>> rechazar(
            @PathVariable Integer id,
            HttpServletRequest request,
            @RequestBody Map<String, String> body) {

        Integer idAdmin = obtenerIdUsuario(request);
        return ResponseEntity.ok(service.rechazarSolicitud(id, idAdmin, body.get("observacion")));
    }
}