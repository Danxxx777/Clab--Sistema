package com.clab.clabbackend.controller;

import com.clab.clabbackend.entities.DriveConfig;
import com.clab.clabbackend.services.DriveConfigService;
import com.clab.clabbackend.services.GoogleDriveService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/drive")
@RequiredArgsConstructor
public class DriveConfigController {

    private final DriveConfigService driveConfigService;
    private final GoogleDriveService googleDriveService;

    // ── ESTADO ────────────────────────────────────────────────────────────────
    @GetMapping("/estado")
    public ResponseEntity<Map<String, Object>> estado() {
        return ResponseEntity.ok(driveConfigService.obtenerEstado());
    }

    // ── ACTUALIZAR CONFIG ─────────────────────────────────────────────────────
    @PutMapping("/config")
    public ResponseEntity<DriveConfig> actualizarConfig(@RequestBody Map<String, String> body) {
        DriveConfig updated = driveConfigService.actualizarConfig(
                body.get("clientId"),
                body.get("clientSecret"),
                body.get("folderId"),
                body.get("folderNombre")
        );
        return ResponseEntity.ok(updated);
    }

    // ── INICIAR AUTH ──────────────────────────────────────────────────────────
    @GetMapping("/iniciar-auth")
    public ResponseEntity<Map<String, String>> iniciarAuth() {
        try {
            String url = googleDriveService.obtenerUrlAutorizacion();
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            log.error("Error generando URL de auth: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── CALLBACK OAuth2 ───────────────────────────────────────────────────────
    @GetMapping("/oauth2/callback")
    public ResponseEntity<String> callback(@RequestParam String code) {
        try {
            googleDriveService.procesarCallback(code);
            // Redirigir al frontend con éxito
            return ResponseEntity.status(302)
                    .header("Location", "http://localhost:4200/configuracion-correo?drive=conectado")
                    .build();
        } catch (Exception e) {
            log.error("Error en callback OAuth2: {}", e.getMessage());
            return ResponseEntity.status(302)
                    .header("Location", "http://localhost:4200/configuracion-correo?drive=error")
                    .build();
        }
    }

    // ── REVOCAR ───────────────────────────────────────────────────────────────
    @PostMapping("/revocar")
    public ResponseEntity<Map<String, String>> revocar() {
        try {
            driveConfigService.revocarAutorizacion();
            return ResponseEntity.ok(Map.of("mensaje", "Autorización revocada correctamente"));
        } catch (Exception e) {
            log.error("Error revocando autorización: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── VERIFICAR CONEXION ────────────────────────────────────────────────────
    @GetMapping("/verificar")
    public ResponseEntity<Map<String, Object>> verificar() {
        try {
            googleDriveService.listarArchivosBackup();
            return ResponseEntity.ok(Map.of(
                    "conectado", true,
                    "mensaje", "Conexión con Drive verificada correctamente"
            ));
        } catch (Exception e) {
            log.error("Error verificando Drive: {}", e.getMessage());
            return ResponseEntity.ok(Map.of(
                    "conectado", false,
                    "mensaje", "No se pudo conectar con Drive: " + e.getMessage()
            ));
        }
    }
}