package com.clab.clabbackend.services;

import com.clab.clabbackend.entities.DriveConfig;
import com.clab.clabbackend.repository.DriveConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DriveConfigService {

    private final DriveConfigRepository driveConfigRepository;

    // ── OBTENER CONFIG ────────────────────────────────────────────────────────
    public DriveConfig obtenerConfig() {
        return driveConfigRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("No hay configuración de Drive registrada"));
    }

    // ── ESTADO ────────────────────────────────────────────────────────────────
    public Map<String, Object> obtenerEstado() {
        DriveConfig config = obtenerConfig();
        Map<String, Object> estado = new HashMap<>();

        // Verificar si el token existe en disco
        boolean tokenExiste = false;
        if (config.getTokensPath() != null) {
            File tokenFile = new File(config.getTokensPath());
            tokenExiste = tokenFile.exists();
        }

        boolean conectado = config.isConectado() && tokenExiste;

        estado.put("conectado",        conectado);
        estado.put("emailCuenta",      config.getEmailCuenta());
        estado.put("folderId",         config.getFolderId());
        estado.put("folderNombre",     config.getFolderNombre());
        estado.put("fechaConexion",    config.getFechaConexion());
        estado.put("fechaActualizacion", config.getFechaActualizacion());
        // Ocultar credenciales sensibles — solo mostrar primeros chars
        String clientId = config.getClientId();
        estado.put("clientIdPreview",
                clientId != null && clientId.length() > 20
                        ? clientId.substring(0, 20) + "..."
                        : clientId);

        return estado;
    }

    // ── ACTUALIZAR CONFIG ─────────────────────────────────────────────────────
    public DriveConfig actualizarConfig(String clientId, String clientSecret,
                                        String folderId, String folderNombre) {
        DriveConfig config = obtenerConfig();

        if (clientId     != null && !clientId.isBlank())     config.setClientId(clientId);
        if (clientSecret != null && !clientSecret.isBlank()) config.setClientSecret(clientSecret);
        if (folderId     != null && !folderId.isBlank())     config.setFolderId(folderId);
        if (folderNombre != null)                            config.setFolderNombre(folderNombre);

        return driveConfigRepository.save(config);
    }

    // ── MARCAR CONECTADO ──────────────────────────────────────────────────────
    public void marcarConectado(String emailCuenta) {
        DriveConfig config = obtenerConfig();
        config.setConectado(true);
        config.setEmailCuenta(emailCuenta);
        config.setFechaConexion(LocalDateTime.now());
        driveConfigRepository.save(config);
    }

    // ── REVOCAR ───────────────────────────────────────────────────────────────
    public void revocarAutorizacion() {
        DriveConfig config = obtenerConfig();

        // Eliminar archivo de token del disco
        if (config.getTokensPath() != null) {
            try {
                File tokenFile = new File(config.getTokensPath());
                File parentDir = tokenFile.getParentFile();
                if (parentDir != null && parentDir.exists()) {
                    // Eliminar todos los archivos dentro de la carpeta tokens/
                    File[] files = parentDir.listFiles();
                    if (files != null) {
                        for (File f : files) {
                            f.delete();
                            log.info("Token eliminado: {}", f.getName());
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Error eliminando token: {}", e.getMessage());
            }
        }

        config.setConectado(false);
        config.setEmailCuenta(null);
        config.setFechaConexion(null);
        driveConfigRepository.save(config);
        log.info("Autorización de Drive revocada");
    }
}