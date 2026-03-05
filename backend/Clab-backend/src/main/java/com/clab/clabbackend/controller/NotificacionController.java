package com.clab.clabbackend.controller;

import com.clab.clabbackend.entities.Notificacion;
import com.clab.clabbackend.entities.Usuario;
import com.clab.clabbackend.repository.UsuarioRepository;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.NotificacionService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    // ── Helper: obtener usuario logueado desde el token ──────────────
    private Usuario obtenerUsuarioActual(HttpServletRequest request) {
        try {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                Claims claims = jwtService.obtenerClaims(header.substring(7));
                Integer idUsuario = Integer.parseInt(claims.getSubject());
                return usuarioRepository.findById(idUsuario).orElse(null);
            }
        } catch (Exception ignored) {}
        return null;
    }

    // GET /notificaciones/mis-notificaciones
    // Retorna todas las notificaciones del usuario logueado
    @GetMapping("/mis-notificaciones")
    public ResponseEntity<List<Notificacion>> getMisNotificaciones(
            HttpServletRequest request) {
        Usuario usuario = obtenerUsuarioActual(request);
        if (usuario == null) return ResponseEntity.status(401).build();

        // Leer el rol del JWT
        String header = request.getHeader("Authorization");
        Claims claims = jwtService.obtenerClaims(header.substring(7));
        String rol = claims.get("rol", String.class);

        return ResponseEntity.ok(
                notificacionService.getMisNotificaciones(usuario, rol)
        );
    }

    // GET /notificaciones/no-leidas/count
    // Retorna el número de notificaciones no leídas (para el badge del dashboard)
    @GetMapping("/no-leidas/count")
    public ResponseEntity<Map<String, Long>> contarNoLeidas(
            HttpServletRequest request) {
        Usuario usuario = obtenerUsuarioActual(request);
        if (usuario == null)
            return ResponseEntity.status(401).build();

        long count = notificacionService.contarNoLeidas(usuario);
        return ResponseEntity.ok(Map.of("noLeidas", count));
    }

    // PUT /notificaciones/leer/{id}
    // Marca una notificación como leída
    @PutMapping("/leer/{id}")
    public ResponseEntity<Void> marcarLeida(@PathVariable Integer id,
                                            HttpServletRequest request) {
        Usuario usuario = obtenerUsuarioActual(request);
        if (usuario == null)
            return ResponseEntity.status(401).build();

        notificacionService.marcarComoLeida(id);
        return ResponseEntity.ok().build();
    }

    // PUT /notificaciones/leer-todas
    // Marca todas las notificaciones del usuario como leídas
    @PutMapping("/leer-todas")
    public ResponseEntity<Void> marcarTodasLeidas(HttpServletRequest request) {
        Usuario usuario = obtenerUsuarioActual(request);
        if (usuario == null)
            return ResponseEntity.status(401).build();

        notificacionService.marcarTodasLeidas(usuario);
        return ResponseEntity.ok().build();
    }
}