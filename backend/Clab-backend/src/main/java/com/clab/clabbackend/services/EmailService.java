package com.clab.clabbackend.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarCorreoRecuperacion(String destino, String token) {

        try {

            String link = "http://localhost:4200/reset-password?token=" + token;

            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true);

            helper.setFrom(fromEmail);
            helper.setTo(destino);
            helper.setSubject("Recuperación de contraseña - CLAB");

            String contenidoHTML =
                    "<div style='font-family: Arial, sans-serif; padding:20px;'>" +
                            "<h2 style='color:#1e7e34;'>Sistema CLAB</h2>" +
                            "<p>Hola,</p>" +
                            "<p>Recibimos una solicitud para cambiar tu contraseña.</p>" +
                            "<p>Haz clic en el siguiente botón:</p>" +

                            "<a href='" + link + "' " +
                            "style='display:inline-block; padding:12px 25px; background-color:#28a745; color:white; text-decoration:none; border-radius:5px; font-weight:bold;'>" +
                            "Cambiar contraseña" +
                            "</a>" +

                            "<p style='margin-top:20px;'>Este enlace expirará en 15 minutos.</p>" +
                            "<hr>" +
                            "<small>Si no solicitaste este cambio, ignora este correo.</small>" +
                            "</div>";

            helper.setText(contenidoHTML, true);

            mailSender.send(mensaje);

        } catch (Exception e) {
            throw new RuntimeException("Error enviando correo");
        }
    }
}
