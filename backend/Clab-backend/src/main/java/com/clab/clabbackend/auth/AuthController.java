package com.clab.clabbackend.auth;

import com.clab.clabbackend.dto.AuthResponseDTO;
import com.clab.clabbackend.dto.LoginRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    // Constructor - inyección de dependencias
    public AuthController(AuthService authService, PasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
    }

    // Login del usuario - valida credenciales y devuelve token
    @PostMapping("/login")
    public AuthResponseDTO login(@RequestBody LoginRequestDTO request) {
        return authService.login(request);
    }

    // Cambia el rol activo del usuario
    @PostMapping("/cambiar-rol")
    public ResponseEntity<?> cambiarRol(@RequestBody Map<String, Object> body) {
        try {
            Integer idUsuario = (Integer) body.get("idUsuario");
            String nombreRol = (String) body.get("nombreRol");
            return ResponseEntity.ok(authService.cambiarRol(idUsuario, nombreRol));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Solicita recuperación de contraseña enviando código al correo
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        try {
            authService.solicitarRecuperacion(body.get("email"));
            return ResponseEntity.ok(Map.of("mensaje", "Código enviado a tu correo"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Verifica el código de recuperación enviado al correo
    @PostMapping("/verificar-codigo")
    public ResponseEntity<?> verificarCodigo(@RequestBody Map<String, String> body) {
        try {
            authService.verificarCodigo(body.get("email"), body.get("codigo"));
            return ResponseEntity.ok(
                    Map.of("mensaje", "Código válido")
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Permite establecer una nueva contraseña
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