package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.UsuarioRequestDTO;
import com.clab.clabbackend.dto.UsuarioResponseDTO;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.AuditoriaService;
import com.clab.clabbackend.services.UsuarioService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AuditoriaService auditoriaService;
    private final JwtService jwtService;

    public UsuarioController(UsuarioService usuarioService,
                             AuditoriaService auditoriaService,
                             JwtService jwtService) {
        this.usuarioService = usuarioService;
        this.auditoriaService = auditoriaService;
        this.jwtService = jwtService;
    }

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
                Object usuarioObj = claims.get("usuario"); // ← claim "usuario", no getSubject()
                if (usuarioObj != null) return usuarioObj.toString();
            }
        } catch (Exception ignored) {}
        return "desconocido";
    }

    @GetMapping("/listar")
    public List<UsuarioResponseDTO> listar() {
        return usuarioService.listar();
    }

    @PostMapping("/crear")
    public UsuarioResponseDTO crear(@RequestBody UsuarioRequestDTO dto, HttpServletRequest request) {
        return usuarioService.crear(dto,
                obtenerIdUsuario(request),
                obtenerUsuario(request),
                auditoriaService.obtenerIp(request));
    }

    @PutMapping("/actualizar/{id}")
    public UsuarioResponseDTO actualizar(@PathVariable Integer id,
                                         @RequestBody UsuarioRequestDTO dto,
                                         HttpServletRequest request) {
        return usuarioService.actualizar(id, dto,
                obtenerIdUsuario(request),
                obtenerUsuario(request),
                auditoriaService.obtenerIp(request));
    }

    @PutMapping("/desactivar/{id}")
    public void desactivar(@PathVariable Integer id, HttpServletRequest request) {
        usuarioService.desactivar(id,
                obtenerIdUsuario(request),
                obtenerUsuario(request),
                auditoriaService.obtenerIp(request));
    }
    @PutMapping("/cambiar-contrasenia")
    public org.springframework.http.ResponseEntity<?> cambiarContrasenia(
            @RequestBody com.clab.clabbackend.dto.CambiarContraseniaDTO dto,
            HttpServletRequest request) {
        try {
            usuarioService.cambiarContrasenia(
                    obtenerIdUsuario(request),
                    dto.getContraseniaActual(),
                    dto.getContraseniaNueva(),
                    obtenerIdUsuario(request),
                    obtenerUsuario(request),
                    auditoriaService.obtenerIp(request));
            return org.springframework.http.ResponseEntity.ok(
                    java.util.Map.of("mensaje", "Contraseña actualizada correctamente"));
        } catch (RuntimeException e) {
            return org.springframework.http.ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Integer id) {
        try {
            return usuarioService.listar().stream()
                    .filter(u -> u.getIdUsuario().equals(id))
                    .findFirst()
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/activar/{id}")
    public void activar(@PathVariable Integer id, HttpServletRequest request) {
        usuarioService.activar(id,
                obtenerIdUsuario(request),
                obtenerUsuario(request),
                auditoriaService.obtenerIp(request));
    }
    @PostMapping("/cambiar-contrasenia-primer-login")
    public ResponseEntity<?> cambiarContraseniaPrimerLogin(
            @RequestBody Map<String, Object> body) {
        try {
            Integer idUsuario = (Integer) body.get("idUsuario");
            String nuevaContrasenia = (String) body.get("nuevaContrasenia");

            usuarioService.cambiarContraseniaPrimerLogin(idUsuario, nuevaContrasenia);

            return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}