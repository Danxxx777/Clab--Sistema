package com.clab.clabbackend.services;

import com.clab.clabbackend.entities.Notificacion;
import com.clab.clabbackend.entities.Usuario;
import com.clab.clabbackend.repository.NotificacionRepository;
import com.clab.clabbackend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepo;
    private final EmailService emailService;
    private final UsuarioRepository usuarioRepo;

    public void crearNotificacion(Usuario destinatario, String tipoNotificacion,
                                  String asunto, String mensajeHTML, String mensajeCorto,
                                  String canal, String rolDestino, String emailOrigen) {
        Notificacion n = new Notificacion();
        n.setUsuario(destinatario);
        n.setTipoNotificacion(tipoNotificacion);
        n.setAsunto(asunto);
        n.setMensaje(mensajeHTML);
        n.setMensajeCorto(mensajeCorto);
        n.setCanal(canal);
        n.setEstado("NO_LEIDA");
        n.setFechaCreacion(LocalDateTime.now());
        n.setRolDestino(rolDestino);
        n.setEmailOrigen(emailOrigen);

        if (canal.equals("EMAIL") || canal.equals("AMBOS")) {
            try {
                emailService.enviarCorreo("NOTIFICACIONES",
                        destinatario.getEmail(), asunto, mensajeHTML);
                n.setFechaEnvio(LocalDateTime.now());
            } catch (Exception e) {
                System.err.println("Error enviando email: " + e.getMessage());
            }
        }

        notificacionRepo.save(n);
    }

    public void crearNotificacion(Usuario destinatario, String tipoNotificacion,
                                  String asunto, String mensajeHTML,
                                  String canal, String rolDestino) {
        crearNotificacion(destinatario, tipoNotificacion, asunto, mensajeHTML, null, canal, rolDestino, null);
    }

    public void notificarNuevaFalla(Usuario encargado, String labNombre,
                                    String descripcion, String reportador,
                                    String emailReportador, Integer fallaId) {
        String asunto = "Nueva falla detectada en " + labNombre;
        String mensajeCorto = "Reportado por " + reportador + " · " + descripcion;
        String html = buildHtml("⚠️ Nueva Falla Detectada", "#e67e22",
                "Se ha reportado una nueva falla:",
                "<b>Laboratorio:</b> " + labNombre +
                        "<br><b>Reportado por:</b> " + reportador +
                        "<br><b>Descripción:</b> " + descripcion,
                "Ver Reporte #" + fallaId);
        crearNotificacion(encargado, "FALLA", asunto, html, mensajeCorto, "AMBOS", "Encargado de Laboratorio", emailReportador);
    }

    public void notificarAdminNuevaFalla(Usuario admin, String labNombre,
                                         String descripcion, String reportador,
                                         String emailReportador, Integer fallaId) {
        String asunto = "Nueva falla reportada en " + labNombre;
        String mensajeCorto = "Reportado por " + reportador + " · " + descripcion;
        String html = buildHtml("⚠️ Nueva Falla", "#e67e22",
                "Se reportó una falla en el sistema:",
                "<b>Laboratorio:</b> " + labNombre +
                        "<br><b>Reportado por:</b> " + reportador +
                        "<br><b>Descripción:</b> " + descripcion,
                "Ver Reporte #" + fallaId);
        crearNotificacion(admin, "FALLA", asunto, html, mensajeCorto, "AMBOS", "Administradorr", emailReportador);
    }

    public void notificarCoordinadorNuevaFalla(Usuario coordinador, String labNombre,
                                               String descripcion, String reportador,
                                               String emailReportador, Integer fallaId) {
        String asunto = "Nueva falla reportada en " + labNombre;
        String mensajeCorto = "Reportado por " + reportador + " · " + descripcion;
        String html = buildHtml("⚠️ Nueva Falla", "#e67e22",
                "Se reportó una falla en el sistema:",
                "<b>Laboratorio:</b> " + labNombre +
                        "<br><b>Reportado por:</b> " + reportador +
                        "<br><b>Descripción:</b> " + descripcion,
                "Ver Reporte #" + fallaId);
        crearNotificacion(coordinador, "FALLA", asunto, html, mensajeCorto, "SISTEMA", "Coordinador", emailReportador);
    }

    public void notificarDecanoNuevaFalla(Usuario decano, String labNombre,
                                          String descripcion, String reportador,
                                          String emailReportador, Integer fallaId) {
        String asunto = "Nueva falla reportada en " + labNombre;
        String mensajeCorto = "Reportado por " + reportador + " · " + descripcion;
        String html = buildHtml("⚠️ Nueva Falla", "#e67e22",
                "Se reportó una falla en el sistema:",
                "<b>Laboratorio:</b> " + labNombre +
                        "<br><b>Reportado por:</b> " + reportador +
                        "<br><b>Descripción:</b> " + descripcion,
                "Ver Reporte #" + fallaId);
        crearNotificacion(decano, "FALLA", asunto, html, mensajeCorto, "SISTEMA", "Decano", emailReportador);
    }

    public void notificarFallaResuelta(Usuario reportador, String labNombre,
                                       Integer fallaId) {
        String asunto = "Tu reporte fue resuelto - " + labNombre;
        String mensajeCorto = "Reporte #" + fallaId + " atendido";
        String html = buildHtml("✅ Reporte Resuelto", "#1e7e34",
                "Tu reporte de falla ha sido atendido:",
                "<b>Laboratorio:</b> " + labNombre + "<br><b>Reporte N°:</b> " + fallaId,
                "Ver Detalle");
        crearNotificacion(reportador, "FALLA_RESUELTA", asunto, html, mensajeCorto, "AMBOS", "Docente", null);
    }

    public void notificarReservaAprobada(Usuario solicitante, String labNombre,
                                         String fecha, String hora) {
        String asunto = "Reserva aprobada - " + labNombre;
        String mensajeCorto = fecha + " · " + hora;
        String html = buildHtml("📅 Reserva Aprobada", "#1e7e34",
                "Tu solicitud de reserva fue aprobada:",
                "<b>Laboratorio:</b> " + labNombre + "<br><b>Fecha:</b> " + fecha +
                        "<br><b>Hora:</b> " + hora, "Ver Reserva");
        crearNotificacion(solicitante, "RESERVA", asunto, html, mensajeCorto, "AMBOS", "Docente", null);
    }

    public void notificarReservaRechazada(Usuario solicitante, String labNombre,
                                          String motivo) {
        String asunto = "Reserva rechazada - " + labNombre;
        String mensajeCorto = "Motivo: " + motivo;
        String html = buildHtml("❌ Reserva Rechazada", "#e74c3c",
                "Tu solicitud fue rechazada:",
                "<b>Laboratorio:</b> " + labNombre + "<br><b>Motivo:</b> " + motivo,
                "Ver Solicitud");
        crearNotificacion(solicitante, "RESERVA", asunto, html, mensajeCorto, "AMBOS", "Docente", null);
    }

    public void notificarLabBloqueado(Usuario afectado, String labNombre,
                                      String motivo) {
        String asunto = "Laboratorio bloqueado - " + labNombre;
        String mensajeCorto = "Motivo: " + motivo;
        String html = buildHtml("🚫 Laboratorio Bloqueado", "#e74c3c",
                "Un laboratorio con reservas activas fue bloqueado:",
                "<b>Laboratorio:</b> " + labNombre + "<br><b>Motivo:</b> " + motivo,
                "Ver Detalles");
        crearNotificacion(afectado, "BLOQUEO", asunto, html, mensajeCorto, "AMBOS", "Docente", null);
    }

    public void notificarAdminUsuarioNuevo(Usuario admin, String nombreNuevoUsuario) {
        String asunto = "Nuevo usuario registrado: " + nombreNuevoUsuario;
        String mensajeCorto = "Usuario: " + nombreNuevoUsuario;
        String html = buildHtml("👤 Nuevo Usuario", "#3498db",
                "Se ha registrado un nuevo usuario en el sistema:",
                "<b>Usuario:</b> " + nombreNuevoUsuario, "Ver Usuarios");
        crearNotificacion(admin, "SISTEMA", asunto, html, mensajeCorto, "SISTEMA", "Administradorr", null);
    }

    // ── Métodos para el frontend ───────────────────────────────────────

    public List<Notificacion> getMisNotificaciones(Usuario usuario, String rol) {
        List<Notificacion> todas = notificacionRepo
                .findByUsuarioOrderByFechaCreacionDesc(usuario);
        return todas.stream()
                .filter(n -> n.getRolDestino() == null || n.getRolDestino().equals(rol))
                .toList();
    }

    public long contarNoLeidas(Usuario usuario, String rol) {
        List<Notificacion> noLeidas = notificacionRepo
                .findByUsuarioAndEstadoOrderByFechaCreacionDesc(usuario, "NO_LEIDA");
        return noLeidas.stream()
                .filter(n -> n.getRolDestino() == null || n.getRolDestino().equals(rol))
                .count();
    }

    public void marcarComoLeida(Integer id) {
        notificacionRepo.findById(id).ifPresent(n -> {
            n.setEstado("LEIDA");
            notificacionRepo.save(n);
        });
    }

    public void marcarTodasLeidas(Usuario usuario) {
        List<Notificacion> noLeidas = notificacionRepo
                .findByUsuarioAndEstadoOrderByFechaCreacionDesc(usuario, "NO_LEIDA");
        noLeidas.forEach(n -> n.setEstado("LEIDA"));
        notificacionRepo.saveAll(noLeidas);
    }

    public void eliminar(Integer id) {
        notificacionRepo.deleteById(id);
    }

    public void responderNotificacion(Integer idNotificacion, String mensajeRespuesta, Usuario remitente) {
        notificacionRepo.findById(idNotificacion).ifPresent(n -> {
            String emailDestino = n.getEmailOrigen() != null
                    ? n.getEmailOrigen()
                    : n.getUsuario().getEmail();
            String asunto = "Respuesta: " + n.getAsunto();
            String html = buildHtml("💬 Respuesta del Sistema", "#3498db",
                    "El encargado ha respondido tu notificación:",
                    "<b>Mensaje original:</b> " + n.getAsunto() +
                            "<br><br><b>Respuesta:</b> " + mensajeRespuesta +
                            "<br><br><small>Respondido por: " + remitente.getNombres() + "</small>",
                    "Ver Sistema");
            try {
                emailService.enviarCorreo("RESPUESTAS", emailDestino, asunto, html);
            } catch (Exception e) {
                System.err.println("Error enviando respuesta: " + e.getMessage());
            }

            usuarioRepo.findByEmail(emailDestino).ifPresent(docente -> {
                crearNotificacion(
                        docente,
                        "FALLA_RESUELTA",
                        asunto,
                        html,
                        mensajeRespuesta,
                        "SISTEMA",
                        "Docente",
                        remitente.getEmail()
                );
            });
        });
    }

    private String buildHtml(String titulo, String color,
                             String subtitulo, String contenido, String botonTexto) {
        return "<div style='font-family:Arial,sans-serif;padding:20px;max-width:500px;'>" +
                "<h2 style='color:" + color + ";'>" + titulo + "</h2>" +
                "<p>" + subtitulo + "</p>" +
                "<div style='background:#f9f9f9;padding:15px;border-radius:8px;margin:16px 0;'>" +
                contenido +
                "</div>" +
                "<hr><small>Sistema de Gestión de Laboratorios — CLAB</small>" +
                "</div>";
    }
}