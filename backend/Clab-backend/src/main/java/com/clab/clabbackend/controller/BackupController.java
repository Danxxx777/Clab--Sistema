package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.BackupConfigDTO;
import com.clab.clabbackend.dto.BackupRegistroDTO;
import com.clab.clabbackend.dto.BackupRespuestaDTO;
import com.clab.clabbackend.services.BackupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/backup")
@RequiredArgsConstructor
public class BackupController {

    private final BackupService backupService;

    // GET /backup/configuracion
    @GetMapping("/configuracion")
    public ResponseEntity<BackupConfigDTO> obtenerConfiguracion() {
        log.info("GET /backup/configuracion");
        BackupConfigDTO config = backupService.obtenerConfiguracion();
        return ResponseEntity.ok(config);
    }

    // POST /backup/configurar
    @PostMapping("/configurar")
    public ResponseEntity<BackupRespuestaDTO> guardarConfiguracion(
            @RequestBody BackupConfigDTO dto) {

        log.info("POST /backup/configurar — frecuencia={}, horas={}, activo={}",
                dto.getFrecuencia(), dto.getHoras(), dto.isActivo());

        BackupRespuestaDTO respuesta = backupService.guardarConfiguracion(dto);

        // Si el servicio reportó error, devolvemos 500 para que Angular
        // pueda distinguir entre éxito y fallo fácilmente
        HttpStatus status = respuesta.isExito() ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR;
        return ResponseEntity.status(status).body(respuesta);
    }

    // POST /backup/ejecutar
    // POST /backup/ejecutar
    @PostMapping("/ejecutar")
    public ResponseEntity<BackupRespuestaDTO> ejecutarBackupManual(
            @RequestParam(defaultValue = "COMPLETO") String modalidad,
            @RequestParam(defaultValue = "SQL") String formato) {

        log.info("POST /backup/ejecutar — modalidad: {}, formato: {}", modalidad, formato);

        com.clab.clabbackend.entities.BackupRegistro.ModalidadBackup mod;
        try {
            mod = com.clab.clabbackend.entities.BackupRegistro.ModalidadBackup.valueOf(modalidad);
        } catch (IllegalArgumentException e) {
            mod = com.clab.clabbackend.entities.BackupRegistro.ModalidadBackup.COMPLETO;
        }

        BackupRespuestaDTO respuesta = backupService.ejecutarBackupManual(mod, formato);
        HttpStatus status = respuesta.isExito() ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR;
        return ResponseEntity.status(status).body(respuesta);
    }


    // GET /backup/historial
    @GetMapping("/historial")
    public ResponseEntity<List<BackupRegistroDTO>> obtenerHistorial() {
        log.info("GET /backup/historial");
        List<BackupRegistroDTO> historial = backupService.obtenerHistorial();
        return ResponseEntity.ok(historial);
    }

    // GET /backup/descargar/{id}
    @GetMapping("/descargar/{id}")
    public ResponseEntity<Resource> descargarBackup(@PathVariable Long id) {
        log.info("GET /backup/descargar/{}", id);

        Path rutaArchivo = backupService.obtenerRutaParaDescarga(id);

        // Si no encontramos el archivo, devolvemos 404
        if (rutaArchivo == null) {
            log.warn("Archivo de backup no encontrado para id={}", id);
            return ResponseEntity.notFound().build();
        }
        try {
            // Convertimos el Path a un Resource que Spring puede enviar como respuesta
            Resource resource = new UrlResource(rutaArchivo.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                log.warn("Archivo no legible: {}", rutaArchivo);
                return ResponseEntity.notFound().build();
            }
            // Nombre del archivo que verá el usuario al descargar
            String nombreDescarga = rutaArchivo.getFileName().toString();

            return ResponseEntity.ok()
                    // application/octet-stream = archivo binario genérico
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    // attachment → fuerza la descarga en vez de abrir en el navegador
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + nombreDescarga + "\"")
                    .body(resource);

        } catch (IOException e) {
            log.error("Error al leer archivo de backup id={}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    // POST /backup/restaurar/{id} — restaurar desde historial local
    @PostMapping("/restaurar/{id}")
    public ResponseEntity<BackupRespuestaDTO> restaurarDesdeHistorial(@PathVariable Long id) {
        log.info("POST /backup/restaurar/{}", id);
        BackupRespuestaDTO respuesta = backupService.restaurarBackup(id);
        HttpStatus status = respuesta.isExito() ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR;
        return ResponseEntity.status(status).body(respuesta);
    }

    // POST /backup/restaurar/archivo — restaurar subiendo un .sql
    @PostMapping("/restaurar/archivo")
    public ResponseEntity<BackupRespuestaDTO> restaurarDesdeArchivo(
            @RequestParam("archivo") org.springframework.web.multipart.MultipartFile archivo) {
        log.info("POST /backup/restaurar/archivo — nombre: {}", archivo.getOriginalFilename());
        BackupRespuestaDTO respuesta = backupService.restaurarDesdeArchivo(archivo);
        HttpStatus status = respuesta.isExito() ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR;
        return ResponseEntity.status(status).body(respuesta);
    }

}