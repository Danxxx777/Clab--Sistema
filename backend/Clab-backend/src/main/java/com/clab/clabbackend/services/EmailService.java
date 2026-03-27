package com.clab.clabbackend.services;

import com.clab.clabbackend.entities.ConfiguracionCorreo;
import com.clab.clabbackend.repository.ConfiguracionCorreoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class EmailService {

    private final ConfiguracionCorreoRepository configRepo;
    private final HttpClient httpClient;

    @Value("${brevo.api-key}")
    private String brevoApiKey;

    public EmailService(ConfiguracionCorreoRepository configRepo) {
        this.configRepo = configRepo;
        this.httpClient = HttpClient.newHttpClient();
    }

    private ConfiguracionCorreo obtenerConfig(String proposito) {
        return configRepo.findFirstByPropositoAndActivoTrue(proposito)
                .orElseGet(() -> configRepo.findFirstByPropositoAndActivoTrue("GENERAL")
                        .orElseGet(() -> configRepo.findFirstByActivoTrue()
                                .orElseThrow(() -> new RuntimeException(
                                        "No hay configuración de correo activa para el propósito: " + proposito))));
    }

    // MÉTODO GENÉRICO
    public void enviarCorreo(String proposito, String destino, String asunto, String contenidoHTML) {
        try {
            ConfiguracionCorreo config = obtenerConfig(proposito);
            String nombreRemitente = config.getNombreRemitente() != null ? config.getNombreRemitente() : "CLAB";
            String emailRemitente = config.getEmailRemitente();

            String body = String.format("""
                {
                    "sender": {"name": "%s", "email": "%s"},
                    "to": [{"email": "%s"}],
                    "subject": "%s",
                    "htmlContent": %s
                }
                """,
                    nombreRemitente,
                    emailRemitente,
                    destino,
                    asunto,
                    toJsonString(contenidoHTML)
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("Content-Type", "application/json")
                    .header("api-key", brevoApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 300) {
                throw new RuntimeException("Brevo error " + response.statusCode() + ": " + response.body());
            }

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error enviando correo [" + proposito + "]: " + e.getMessage());
        }
    }

    // Convierte el HTML a JSON string escapado
    private String toJsonString(String html) {
        return "\"" + html
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                + "\"";
    }

    // PROBAR CONFIGURACIÓN
    public void probarConfiguracion(Integer idConfig) {
        ConfiguracionCorreo config = configRepo.findById(idConfig)
                .orElseThrow(() -> new RuntimeException("Configuración no encontrada"));

        String html =
                "<div style='font-family:Arial,sans-serif;padding:20px;'>" +
                        "<h3 style='color:#39ff14;'>✅ Prueba exitosa</h3>" +
                        "<p>La configuración <strong>" + config.getNombreDisplay() + "</strong> " +
                        "está funcionando correctamente.</p>" +
                        "<p>Proveedor: <strong>Brevo API</strong></p>" +
                        "</div>";

        enviarCorreo("GENERAL", config.getEmailRemitente(), "Prueba de configuración - CLAB", html);
    }

    // CORREO DE RECUPERACIÓN DE CONTRASEÑA
    public void enviarCorreoRecuperacion(String destino, String codigo) {
        String contenidoHTML =
                "<div style='font-family: Arial, sans-serif; padding:20px; max-width:500px;'>" +
                        "<h2 style='color:#1e7e34;'>Sistema CLAB</h2>" +
                        "<p>Hola,</p>" +
                        "<p>Recibimos una solicitud para cambiar tu contraseña.</p>" +
                        "<p>Tu código de verificación es:</p>" +
                        "<div style='font-size:36px; font-weight:bold; letter-spacing:10px; " +
                        "color:#1a4731; background:#f0faf4; padding:20px; text-align:center; " +
                        "border-radius:10px; margin:20px 0;'>" + codigo + "</div>" +
                        "<p>Este código expirará en <strong>15 minutos</strong>.</p>" +
                        "<hr>" +
                        "<small>Si no solicitaste este cambio, ignora este correo.</small>" +
                        "</div>";

        enviarCorreo("RECUPERACION", destino, "Recuperación de contraseña - CLAB", contenidoHTML);
    }

    // CORREO DE NOTIFICACIÓN DE RESERVA
    public void enviarNotificacionReserva(String destino, String nombreUsuario,
                                          String laboratorio, String fecha, String hora) {
        String contenidoHTML =
                "<div style='font-family: Arial, sans-serif; padding:20px; max-width:500px;'>" +
                        "<h2 style='color:#1e7e34;'>Sistema CLAB — Confirmación de Reserva</h2>" +
                        "<p>Hola <strong>" + nombreUsuario + "</strong>,</p>" +
                        "<p>Tu reserva ha sido confirmada:</p>" +
                        "<table style='width:100%; border-collapse:collapse; margin:16px 0;'>" +
                        "<tr><td style='padding:8px; border:1px solid #ddd; font-weight:bold;'>Laboratorio</td>" +
                        "<td style='padding:8px; border:1px solid #ddd;'>" + laboratorio + "</td></tr>" +
                        "<tr><td style='padding:8px; border:1px solid #ddd; font-weight:bold;'>Fecha</td>" +
                        "<td style='padding:8px; border:1px solid #ddd;'>" + fecha + "</td></tr>" +
                        "<tr><td style='padding:8px; border:1px solid #ddd; font-weight:bold;'>Hora</td>" +
                        "<td style='padding:8px; border:1px solid #ddd;'>" + hora + "</td></tr>" +
                        "</table>" +
                        "<p style='color:#666;'>Recuerda asistir puntualmente. " +
                        "2 inasistencias consecutivas generarán un bloqueo automático.</p>" +
                        "<hr><small>Sistema de Gestión de Laboratorios — CLAB</small>" +
                        "</div>";

        enviarCorreo("RESERVAS", destino, "Confirmación de Reserva - CLAB", contenidoHTML);
    }

    // CORREO DE BLOQUEO POR INASISTENCIAS
    public void enviarNotificacionBloqueo(String destino, String nombreUsuario) {
        String contenidoHTML =
                "<div style='font-family: Arial, sans-serif; padding:20px; max-width:500px;'>" +
                        "<h2 style='color:#e74c3c;'>Sistema CLAB — Cuenta Bloqueada</h2>" +
                        "<p>Hola <strong>" + nombreUsuario + "</strong>,</p>" +
                        "<p>Tu cuenta ha sido <strong style='color:#e74c3c;'>bloqueada temporalmente</strong> " +
                        "debido a <strong>2 inasistencias consecutivas</strong> a tus reservas de laboratorio.</p>" +
                        "<p>No podrás realizar nuevas reservas hasta que un administrador levante el bloqueo.</p>" +
                        "<p>Si crees que esto es un error, contacta al administrador del sistema.</p>" +
                        "<hr><small>Sistema de Gestión de Laboratorios — CLAB</small>" +
                        "</div>";

        enviarCorreo("NOTIFICACIONES", destino, "Cuenta bloqueada por inasistencias - CLAB", contenidoHTML);
    }

    // CORREO DE CREDENCIALES — nuevo usuario aprobado
    public void enviarCredenciales(String destino, String nombreUsuario,
                                   String username, String contraseniaTemp) {
        String contenidoHTML =
                "<div style='font-family: Arial, sans-serif; padding:20px; max-width:500px;'>" +
                        "<h2 style='color:#1e7e34;'>Sistema CLAB — Acceso aprobado</h2>" +
                        "<p>Hola <strong>" + nombreUsuario + "</strong>,</p>" +
                        "<p>Tu solicitud de acceso ha sido <strong>aprobada</strong>. " +
                        "Estas son tus credenciales de acceso:</p>" +
                        "<table style='width:100%; border-collapse:collapse; margin:16px 0;'>" +
                        "<tr><td style='padding:8px; border:1px solid #ddd; font-weight:bold;'>Usuario</td>" +
                        "<td style='padding:8px; border:1px solid #ddd;'>" + username + "</td></tr>" +
                        "<tr><td style='padding:8px; border:1px solid #ddd; font-weight:bold;'>Contraseña temporal</td>" +
                        "<td style='padding:8px; border:1px solid #ddd;'>" + contraseniaTemp + "</td></tr>" +
                        "</table>" +
                        "<p style='color:#e74c3c;'><strong>Importante:</strong> Al ingresar por primera vez " +
                        "se te pedirá cambiar tu contraseña.</p>" +
                        "<hr><small>Sistema de Gestión de Laboratorios — CLAB</small>" +
                        "</div>";

        enviarCorreo("GENERAL", destino, "Credenciales de acceso - CLAB", contenidoHTML);
    }

    // CORREO DE RECHAZO DE SOLICITUD
    public void enviarRechazoSolicitud(String destino, String nombreUsuario, String observacion) {
        String contenidoHTML =
                "<div style='font-family: Arial, sans-serif; padding:20px; max-width:500px;'>" +
                        "<h2 style='color:#e74c3c;'>Sistema CLAB — Solicitud rechazada</h2>" +
                        "<p>Hola <strong>" + nombreUsuario + "</strong>,</p>" +
                        "<p>Lamentamos informarte que tu solicitud de acceso al sistema ha sido " +
                        "<strong style='color:#e74c3c;'>rechazada</strong>.</p>" +
                        (observacion != null && !observacion.isBlank()
                                ? "<p><strong>Motivo:</strong> " + observacion + "</p>"
                                : "") +
                        "<p>Si crees que esto es un error, contacta directamente al administrador.</p>" +
                        "<hr><small>Sistema de Gestión de Laboratorios — CLAB</small>" +
                        "</div>";

        enviarCorreo("GENERAL", destino, "Solicitud de acceso rechazada - CLAB", contenidoHTML);
    }
}