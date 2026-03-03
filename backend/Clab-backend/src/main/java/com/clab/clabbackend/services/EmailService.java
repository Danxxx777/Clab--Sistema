package com.clab.clabbackend.services;

import com.clab.clabbackend.entities.ConfiguracionCorreo;
import com.clab.clabbackend.repository.ConfiguracionCorreoRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Service
public class EmailService {

    private final ConfiguracionCorreoRepository configRepo;

    public EmailService(ConfiguracionCorreoRepository configRepo) {
        this.configRepo = configRepo;
    }

    private JavaMailSenderImpl construirMailSender(ConfiguracionCorreo config) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(config.getHost());
        sender.setPort(config.getPuerto());
        sender.setUsername(config.getEmailRemitente());
        sender.setPassword(config.getPasswordRemitente());

        // Protocolo (SMTP por defecto)
        String protocolo = config.getProtocolo() != null
                ? config.getProtocolo().toLowerCase()
                : "smtp";
        sender.setProtocol(protocolo);

        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", protocolo);
        props.put("mail.smtp.auth", String.valueOf(config.getAuthHabilitado()));

        boolean sslHabilitado = Boolean.TRUE.equals(config.getSslHabilitado());
        boolean starttlsHabilitado = Boolean.TRUE.equals(config.getStarttlsHabilitado());
        int timeout = config.getTimeoutMs() != null ? config.getTimeoutMs() : 5000;

        if (sslHabilitado) {
            //  SSL en puerto 465 — conexión cifrada desde el inicio
            props.put("mail.smtp.ssl.enable", "true");
            props.put("mail.smtp.ssl.trust", config.getHost());
            props.put("mail.smtp.starttls.enable", "false");
            props.put("mail.smtp.starttls.required", "false");
            props.put("mail.smtp.socketFactory.port", String.valueOf(config.getPuerto()));
            props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
            props.put("mail.smtp.socketFactory.fallback", "false");
        } else if (starttlsHabilitado) {
            //  STARTTLS en puerto 587 — inicia sin cifrado, luego negocia TLS
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
            props.put("mail.smtp.ssl.enable", "false");
            props.put("mail.smtp.ssl.trust", config.getHost());
        } else {
            // Sin cifrado (solo para entornos internos/testing)
            props.put("mail.smtp.starttls.enable", "false");
            props.put("mail.smtp.ssl.enable", "false");
        }

        // Timeouts para evitar cuelgues
        props.put("mail.smtp.connectiontimeout", String.valueOf(timeout));
        props.put("mail.smtp.timeout", String.valueOf(timeout));
        props.put("mail.smtp.writetimeout", String.valueOf(timeout));

        props.put("mail.debug", "false");

        return sender;
    }

    private ConfiguracionCorreo obtenerConfig(String proposito) {
        return configRepo.findFirstByPropositoAndActivoTrue(proposito).orElseGet(() -> configRepo.findFirstByPropositoAndActivoTrue("GENERAL")
                        .orElseGet(() -> configRepo.findFirstByActivoTrue().orElseThrow(() -> new RuntimeException(
                                        "No hay configuración de correo activa para el propósito: " + proposito))));
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

        enviarCorreo("NOTIFICACIONES", destino,
                "Cuenta bloqueada por inasistencias - CLAB", contenidoHTML);
    }


    // MÉTODO GENÉRICO — úsalo para cualquier correo futuro
    public void enviarCorreo(String proposito, String destino,
                             String asunto, String contenidoHTML) {
        try {
            ConfiguracionCorreo config = obtenerConfig(proposito);
            JavaMailSenderImpl sender = construirMailSender(config);
            MimeMessage mensaje = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            String nombreRemitente = config.getNombreRemitente() != null
                    ? config.getNombreRemitente() : "CLAB";

            helper.setFrom(config.getEmailRemitente(), nombreRemitente);
            helper.setTo(destino);
            helper.setSubject(asunto);
            helper.setText(contenidoHTML, true);
            sender.send(mensaje);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error enviando correo [" + proposito + "]: " + e.getMessage());
        }
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
                        "<p>Protocolo: <strong>" +
                        (Boolean.TRUE.equals(config.getSslHabilitado()) ? "SSL (puerto 465)"
                                : Boolean.TRUE.equals(config.getStarttlsHabilitado()) ? "STARTTLS (puerto 587)"
                                : "Sin cifrado") +
                        "</strong></p>" +
                        "</div>";

        try {
            JavaMailSenderImpl sender = construirMailSender(config);
            MimeMessage mensaje = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(config.getEmailRemitente(),
                    config.getNombreRemitente() != null ? config.getNombreRemitente() : "CLAB");
            helper.setTo(config.getEmailRemitente()); // se envía a sí mismo como prueba
            helper.setSubject("Prueba de configuración SMTP - CLAB");
            helper.setText(html, true);
            sender.send(mensaje);
        } catch (Exception e) {
            throw new RuntimeException("Error en prueba: " + e.getMessage());
        }
    }
}