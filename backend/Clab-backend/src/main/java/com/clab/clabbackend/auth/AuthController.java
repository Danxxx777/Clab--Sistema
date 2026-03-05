package com.clab.clabbackend.auth;

import com.clab.clabbackend.dto.AuthResponseDTO;
import com.clab.clabbackend.dto.LoginRequestDTO;
import com.clab.clabbackend.services.AuditoriaService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final AuditoriaService auditoriaService;

    public AuthController(AuthService authService, PasswordEncoder passwordEncoder,
                          AuditoriaService auditoriaService) {
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
        this.auditoriaService = auditoriaService;
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@RequestBody LoginRequestDTO request, HttpServletRequest httpRequest) {
        String ip = auditoriaService.obtenerIp(httpRequest);
        return authService.login(request, ip);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, Object> body, HttpServletRequest httpRequest) {
        try {
            String token = (String) body.get("token");
            Integer idUsuario = (Integer) body.get("idUsuario");
            String ip = auditoriaService.obtenerIp(httpRequest);
            authService.logout(token, idUsuario, ip);
            return ResponseEntity.ok(Map.of("mensaje", "Sesión cerrada correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/cambiar-rol")
    public ResponseEntity<?> cambiarRol(@RequestBody Map<String, Object> body, HttpServletRequest httpRequest) {
        try {
            Integer idUsuario = (Integer) body.get("idUsuario");
            String nombreRol = (String) body.get("nombreRol");
            String ip = auditoriaService.obtenerIp(httpRequest);
            return ResponseEntity.ok(authService.cambiarRol(idUsuario, nombreRol, ip));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        try {
            authService.solicitarRecuperacion(body.get("email"));
            return ResponseEntity.ok(Map.of("mensaje", "Código enviado a tu correo"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verificar-codigo")
    public ResponseEntity<?> verificarCodigo(@RequestBody Map<String, String> body) {
        try {
            authService.verificarCodigo(body.get("email"), body.get("codigo"));
            return ResponseEntity.ok(Map.of("mensaje", "Código válido"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        try {
            authService.resetPassword(body.get("email"), body.get("codigo"), body.get("nuevaPassword"));
            return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}