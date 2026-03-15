package com.clab.clabbackend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * DTO de respuesta simple para operaciones de backup.
 *
 * Se usa para responder al frontend después de:
 *   - POST /backup/ejecutar    → backup manual
 *   - POST /backup/configurar  → guardar configuración
 *
 * Es una respuesta sencilla que dice si salió bien o mal,
 * con un mensaje descriptivo para mostrar en el toast del frontend.
 *
 * Ejemplo de respuesta exitosa:
 * {
 *   "exito": true,
 *   "mensaje": "Backup completado exitosamente",
 *   "detalle": "Archivo guardado: backup_2024-01-15_02-00-00.sql (14.3 MB)"
 * }
 *
 * Ejemplo de respuesta con error:
 * {
 *   "exito": false,
 *   "mensaje": "Error al ejecutar el backup",
 *   "detalle": "No se pudo conectar con pg_dump. Verifique que PostgreSQL esté corriendo."
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackupRespuestaDTO {

    /**
     * true  → la operación salió bien
     * false → algo falló
     */
    private boolean exito;

    /**
     * Mensaje corto para el título del toast.
     * Ej: "Backup completado exitosamente"
     */
    private String mensaje;

    /**
     * Detalle adicional opcional para el cuerpo del toast.
     * Ej: "Archivo: backup_2024-01-15.sql (14.3 MB)"
     * Puede ser null si no hay nada extra que informar.
     */
    private String detalle;

    // ── Factories estáticas para crear respuestas rápido ─────────────────

    /**
     * Crea una respuesta de éxito rápidamente.
     * Uso: BackupRespuestaDTO.ok("Backup completado", "14.3 MB guardados")
     */
    public static BackupRespuestaDTO ok(String mensaje, String detalle) {
        return BackupRespuestaDTO.builder()
                .exito(true)
                .mensaje(mensaje)
                .detalle(detalle)
                .build();
    }

    /**
     * Crea una respuesta de error rápidamente.
     * Uso: BackupRespuestaDTO.error("No se pudo ejecutar", ex.getMessage())
     */
    public static BackupRespuestaDTO error(String mensaje, String detalle) {
        return BackupRespuestaDTO.builder()
                .exito(false)
                .mensaje(mensaje)
                .detalle(detalle)
                .build();
    }
}