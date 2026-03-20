package com.clab.clabbackend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.hibernate.exception.GenericJDBCException;
import java.time.LocalDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "status", 403,
                "error", "Acceso denegado",
                "mensaje", "No tienes permisos para realizar esta acción.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "status", 400,
                "error", "Error en la solicitud",
                "mensaje", ex.getMessage(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", 500,
                "error", "Error interno del servidor",
                "mensaje", "Ocurrió un error inesperado. Intenta de nuevo.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }



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
}