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

    private String obtenerRolActual(HttpServletRequest request) {
        try {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                Claims claims = jwtService.obtenerClaims(header.substring(7));
                return claims.get("rol", String.class);
            }
        } catch (Exception ignored) {}
        return null;
    }

    @GetMapping("/mis-notificaciones")
    public ResponseEntity<List<Notificacion>> getMisNotificaciones(HttpServletRequest request) {
        Usuario usuario = obtenerUsuarioActual(request);
        if (usuario == null) return ResponseEntity.status(401).build();
        String rol = obtenerRolActual(request);
        return ResponseEntity.ok(notificacionService.getMisNotificaciones(usuario, rol));
    }

    @GetMapping("/no-leidas/count")
    public ResponseEntity<Map<String, Long>> contarNoLeidas(HttpServletRequest request) {
        Usuario usuario = obtenerUsuarioActual(request);
        if (usuario == null) return ResponseEntity.status(401).build();
        String rol = obtenerRolActual(request);
        long count = notificacionService.contarNoLeidas(usuario, rol);
        return ResponseEntity.ok(Map.of("noLeidas", count));
    }
    @PutMapping("/leer/{id}")
    public ResponseEntity<Void> marcarLeida(@PathVariable Integer id,
                                            HttpServletRequest request) {
        Usuario usuario = obtenerUsuarioActual(request);
        if (usuario == null) return ResponseEntity.status(401).build();
        notificacionService.marcarComoLeida(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/leer-todas")
    public ResponseEntity<Void> marcarTodasLeidas(HttpServletRequest request) {
        Usuario usuario = obtenerUsuarioActual(request);
        if (usuario == null) return ResponseEntity.status(401).build();
        notificacionService.marcarTodasLeidas(usuario);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id,
                                         HttpServletRequest request) {
        Usuario usuario = obtenerUsuarioActual(request);
        if (usuario == null) return ResponseEntity.status(401).build();
        notificacionService.eliminar(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/responder/{id}")
    public ResponseEntity<Void> responder(@PathVariable Integer id,
                                          @RequestBody Map<String, String> body,
                                          HttpServletRequest request) {
        Usuario usuario = obtenerUsuarioActual(request);
        if (usuario == null) return ResponseEntity.status(401).build();
        notificacionService.responderNotificacion(id, body.get("mensaje"), usuario);
        return ResponseEntity.ok().build();
    }
}