package com.clab.clabbackend.auth;

import com.clab.clabbackend.dto.AuthResponseDTO;
import com.clab.clabbackend.dto.LoginRequestDTO;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthService authService,
                          PasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@RequestBody LoginRequestDTO request) {
        return authService.login(request);
    }

    @PostMapping("/hash")
    public String generarHash(@RequestBody Map<String, String> body) {
        return passwordEncoder.encode(body.get("password"));
    }
    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam String email) {
        authService.solicitarRecuperacion(email);
        return "Token generado correctamente";
    }
    @PostMapping("/reset-password")
    public String resetPassword(
            @RequestParam String token,
            @RequestParam String nuevaPassword) {

        authService.resetPassword(token, nuevaPassword);
        return "Contraseña actualizada correctamente";
    }


}
