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

        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", config.getAuthHabilitado().toString());
        props.put("mail.smtp.starttls.enable", config.getStarttlsHabilitado().toString());
        props.put("mail.debug", "false");

        return sender;
    }

    // 👈 Obtener config por propósito con fallback a GENERAL
    private ConfiguracionCorreo obtenerConfig(String proposito) {
        return configRepo.findFirstByPropositoAndActivoTrue(proposito)
                .orElseGet(() -> configRepo.findFirstByPropositoAndActivoTrue("GENERAL")
                        .orElseGet(() -> configRepo.findFirstByActivoTrue()
                                .orElseThrow(() -> new RuntimeException("No hay configuración de correo activa"))));
    }

    public void enviarCorreoRecuperacion(String destino, String codigo) {
        try {
            ConfiguracionCorreo config = obtenerConfig("RECUPERACION"); // 👈

            JavaMailSenderImpl sender = construirMailSender(config);
            MimeMessage mensaje = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true);

            String nombreRemitente = config.getNombreRemitente() != null
                    ? config.getNombreRemitente() : "CLAB";

            helper.setFrom(config.getEmailRemitente(), nombreRemitente);
            helper.setTo(destino);
            helper.setSubject("Recuperación de contraseña - CLAB");

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

            helper.setText(contenidoHTML, true);
            sender.send(mensaje);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error enviando correo: " + e.getMessage());
        }
    }

    // 👈 Método genérico para futuros usos
    public void enviarCorreo(String proposito, String destino, String asunto, String contenidoHTML) {
        try {
            ConfiguracionCorreo config = obtenerConfig(proposito);
            JavaMailSenderImpl sender = construirMailSender(config);
            MimeMessage mensaje = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true);

            String nombreRemitente = config.getNombreRemitente() != null
                    ? config.getNombreRemitente() : "CLAB";

            helper.setFrom(config.getEmailRemitente(), nombreRemitente);
            helper.setTo(destino);
            helper.setSubject(asunto);
            helper.setText(contenidoHTML, true);
            sender.send(mensaje);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error enviando correo: " + e.getMessage());
        }
    }
}