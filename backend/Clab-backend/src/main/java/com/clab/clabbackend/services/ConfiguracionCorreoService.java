package com.clab.clabbackend.services;

import com.clab.clabbackend.entities.ConfiguracionCorreo;
import com.clab.clabbackend.repository.ConfiguracionCorreoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ConfiguracionCorreoService {

    private final ConfiguracionCorreoRepository repo;
    private final EmailService emailService;

    public ConfiguracionCorreoService(ConfiguracionCorreoRepository repo,
                                      EmailService emailService) {
        this.repo = repo;
        this.emailService = emailService;
    }

    // Listar todos
    public List<ConfiguracionCorreo> listar() {
        return repo.findAllByOrderByIdConfigAsc();
    }

    // Obtener por propósito con fallback a GENERAL
    public ConfiguracionCorreo obtenerPorProposito(String proposito) {
        return repo.findFirstByPropositoAndActivoTrue(proposito)
                .orElseGet(() -> repo.findFirstByPropositoAndActivoTrue("GENERAL")
                        .orElseThrow(() -> new RuntimeException(
                                "No hay configuración de correo activa")));
    }

    // Crear nuevo
    public ConfiguracionCorreo crear(ConfiguracionCorreo config) {
        // Auto-detectar proveedor si no viene
        if (config.getProveedor() == null || config.getProveedor().isBlank()) {
            config.setProveedor(detectarProveedor(config.getHost()));
        }
        // Auto-configurar SSL según puerto
        if (config.getPuerto() != null && config.getPuerto() == 465) {
            config.setSslHabilitado(true);
            config.setStarttlsHabilitado(false);
        } else if (config.getPuerto() != null && config.getPuerto() == 587) {
            config.setSslHabilitado(false);
            config.setStarttlsHabilitado(true);
        }
        return repo.save(config);
    }

    // Actualizar
    public ConfiguracionCorreo actualizar(Integer id, ConfiguracionCorreo nueva) {
        ConfiguracionCorreo actual = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Configuración no encontrada"));

        actual.setNombreDisplay(nueva.getNombreDisplay());
        actual.setProposito(nueva.getProposito());
        actual.setHost(nueva.getHost());
        actual.setPuerto(nueva.getPuerto());
        actual.setEmailRemitente(nueva.getEmailRemitente());
        actual.setNombreRemitente(nueva.getNombreRemitente());
        actual.setAuthHabilitado(nueva.getAuthHabilitado());
        actual.setStarttlsHabilitado(nueva.getStarttlsHabilitado());
        actual.setSslHabilitado(nueva.getSslHabilitado());
        actual.setProtocolo(nueva.getProtocolo());
        actual.setTimeoutMs(nueva.getTimeoutMs());
        actual.setProveedor(nueva.getProveedor() != null
                ? nueva.getProveedor()
                : detectarProveedor(nueva.getHost()));

        // Solo actualizar contraseña si viene una nueva
        if (nueva.getPasswordRemitente() != null && !nueva.getPasswordRemitente().isBlank()) {
            actual.setPasswordRemitente(nueva.getPasswordRemitente());
        }

        // Auto-ajustar SSL/STARTTLS según puerto
        if (nueva.getPuerto() != null && nueva.getPuerto() == 465) {
            actual.setSslHabilitado(true);
            actual.setStarttlsHabilitado(false);
        } else if (nueva.getPuerto() != null && nueva.getPuerto() == 587) {
            actual.setSslHabilitado(false);
            actual.setStarttlsHabilitado(true);
        }

        return repo.save(actual);
    }

    // Cambiar estado activo/inactivo
    public ConfiguracionCorreo cambiarEstado(Integer id, Boolean activo) {
        ConfiguracionCorreo config = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Configuración no encontrada"));
        config.setActivo(activo);
        return repo.save(config);
    }

    // Eliminar
    public void eliminar(Integer id) {
        repo.deleteById(id);
    }

    // Probar configuración
    public void probar(Integer id) {
        emailService.probarConfiguracion(id);
    }

    public List<Map<String, Object>> obtenerPresets() {
        return List.of(
                Map.of(
                        "proveedor",  "GMAIL",
                        "nombre",     "Gmail",
                        "host",       "smtp.gmail.com",
                        "puertoSSL",  465,
                        "puertoTLS",  587,
                        "ssl",        false,
                        "starttls",   true,
                        "nota",       "Requiere contraseña de aplicación (2FA activado)"
                ),
                Map.of(
                        "proveedor",  "OUTLOOK",
                        "nombre",     "Outlook / Office 365",
                        "host",       "smtp.office365.com",
                        "puertoSSL",  465,
                        "puertoTLS",  587,
                        "ssl",        false,
                        "starttls",   true,
                        "nota",       "Usar smtp.office365.com con STARTTLS"
                ),
                Map.of(
                        "proveedor",  "YAHOO",
                        "nombre",     "Yahoo Mail",
                        "host",       "smtp.mail.yahoo.com",
                        "puertoSSL",  465,
                        "puertoTLS",  587,
                        "ssl",        true,
                        "starttls",   false,
                        "nota",       "Requiere contraseña de aplicación"
                ),
                Map.of(
                        "proveedor",  "HOTMAIL",
                        "nombre",     "Hotmail",
                        "host",       "smtp.live.com",
                        "puertoSSL",  465,
                        "puertoTLS",  587,
                        "ssl",        false,
                        "starttls",   true,
                        "nota",       "Misma configuración que Outlook"
                ),
                Map.of(
                        "proveedor",  "CUSTOM",
                        "nombre",     "Servidor personalizado",
                        "host",       "",
                        "puertoSSL",  465,
                        "puertoTLS",  587,
                        "ssl",        false,
                        "starttls",   true,
                        "nota",       "Configura manualmente según tu proveedor"
                )
        );
    }

    // UTILIDAD: detectar proveedor por host
    private String detectarProveedor(String host) {
        if (host == null) return "CUSTOM";
        String h = host.toLowerCase();
        if (h.contains("gmail"))                                    return "GMAIL";
        if (h.contains("outlook") || h.contains("office365"))      return "OUTLOOK";
        if (h.contains("yahoo"))                                    return "YAHOO";
        if (h.contains("hotmail") || h.contains("live.com"))       return "HOTMAIL";
        return "CUSTOM";
    }
}