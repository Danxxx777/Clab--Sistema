package com.clab.clabbackend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.hibernate.exception.GenericJDBCException;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.CannotGetJdbcConnectionException;
import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.dao.InvalidDataAccessResourceUsageException;
import org.springframework.security.authentication.BadCredentialsException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Más específico primero — sin BD
    @ExceptionHandler({
            CannotGetJdbcConnectionException.class,
            DataAccessResourceFailureException.class
    })
    public ResponseEntity<Map<String, Object>> handleNoConnection(Exception ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "status", 503,
                "error", "Base de datos no disponible",
                "mensaje", "No hay base de datos activa. Restaura un backup para continuar.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    // 2. Errores PostgreSQL via stored procedures
    @ExceptionHandler(GenericJDBCException.class)
    public ResponseEntity<Map<String, Object>> handleGenericJDBC(GenericJDBCException ex) {
        String mensaje = "Error en la base de datos";
        Throwable cause = ex.getCause();
        if (cause != null && cause.getMessage() != null) {
            String raw = cause.getMessage();
            if (raw.contains("ERROR:")) {
                mensaje = raw.substring(raw.indexOf("ERROR:") + 7).trim();
                if (mensaje.contains("\n")) {
                    mensaje = mensaje.substring(0, mensaje.indexOf("\n")).trim();
                }
            }
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "status", 400,
                "error", "Error de validación",
                "mensaje", mensaje,
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    // 3. Otros DataAccessException (no conexión)
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, Object>> handleDataAccess(DataAccessException ex) {
        String msg = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
        boolean esConexion = msg.contains("connection") || msg.contains("hikari")
                || msg.contains("datasource") || msg.contains("unable to acquire");
        if (esConexion) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                    "status", 503,
                    "error", "Base de datos no disponible",
                    "mensaje", "No hay base de datos activa. Restaura un backup para continuar.",
                    "timestamp", LocalDateTime.now().toString()
            ));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", 500,
                "error", "Error de base de datos",
                "mensaje", "Ocurrió un error con la base de datos.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    // 4. Acceso denegado
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "status", 403,
                "error", "Acceso denegado",
                "mensaje", "No tienes permisos para realizar esta acción.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    // 5. RuntimeException genérico
        /*@ExceptionHandler(RuntimeException.class)

    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "status", 400,
                "error", "Error en la solicitud",
                "mensaje", ex.getMessage(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }*/

    // 6. Catch-all
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", 500,
                "error", "Error interno del servidor",
                "mensaje", "Ocurrió un error inesperado. Intenta de nuevo.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @ExceptionHandler(InvalidDataAccessResourceUsageException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidUsage(InvalidDataAccessResourceUsageException ex) {
        String msg = ex.getMessage() != null ? ex.getMessage() : "";
        if (msg.contains("does not exist") || msg.contains("no existe")) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                    "status", 503,
                    "error", "Base de datos sin datos",
                    "mensaje", "La base de datos no tiene datos. Restaura un backup para continuar.",
                    "timestamp", LocalDateTime.now().toString()
            ));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", 500,
                "error", "Error interno del servidor",
                "mensaje", "Ocurrió un error inesperado.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        if ("__BD_VACIA__".equals(ex.getMessage())) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                    "status", 503,
                    "error", "Base de datos sin datos",
                    "mensaje", "La base de datos no tiene datos. Restaura un backup para continuar.",
                    "timestamp", LocalDateTime.now().toString()
            ));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "status", 400,
                "error", "Error en la solicitud",
                "mensaje", ex.getMessage(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @ExceptionHandler(JpaSystemException.class)
    public ResponseEntity<Map<String, Object>> handleJpaSystem(JpaSystemException ex) {
        String mensaje = "Error en la base de datos";
        String msg = ex.getMessage() != null ? ex.getMessage() : "";

        if (msg.contains("ERROR:")) {
            mensaje = msg.substring(msg.indexOf("ERROR:") + 7).trim();
            if (mensaje.contains("\n")) mensaje = mensaje.substring(0, mensaje.indexOf("\n")).trim();
            if (mensaje.contains("<EOL>")) mensaje = mensaje.substring(0, mensaje.indexOf("<EOL>")).trim();
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "status", 400,
                "error", "Error de validación",
                "mensaje", mensaje,
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}