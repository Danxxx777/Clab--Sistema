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

    public List<ConfiguracionCorreo> listar() {
        return repo.findAllByOrderByIdConfigAsc();
    }

    public ConfiguracionCorreo obtenerPorProposito(String proposito) {
        return repo.findFirstByPropositoAndActivoTrue(proposito)
                .orElseGet(() -> repo.findFirstByPropositoAndActivoTrue("GENERAL")
                        .orElseThrow(() -> new RuntimeException(
                                "No hay configuración de correo activa")));
    }

    public ConfiguracionCorreo crear(ConfiguracionCorreo config) {
        if (config.getProveedor() == null || config.getProveedor().isBlank()) {
            config.setProveedor(detectarProveedor(config.getHost()));
        }
        ajustarSslPorPuerto(config, config.getPuerto());
        return repo.save(config);
    }

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

        if (nueva.getPasswordRemitente() != null && !nueva.getPasswordRemitente().isBlank()) {
            actual.setPasswordRemitente(nueva.getPasswordRemitente());
        }

        ajustarSslPorPuerto(actual, nueva.getPuerto());
        return repo.save(actual);
    }

    public ConfiguracionCorreo cambiarEstado(Integer id, Boolean activo) {
        ConfiguracionCorreo config = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Configuración no encontrada"));
        config.setActivo(activo);
        return repo.save(config);
    }

    public void eliminar(Integer id) {
        repo.deleteById(id);
    }

    public void probar(Integer id) {
        emailService.probarConfiguracion(id);
    }

    //  Solo Gmail y Custom
    public List<Map<String, Object>> obtenerPresets() {
        return List.of(
                Map.of(
                        "proveedor", "GMAIL",
                        "nombre",    "Gmail",
                        "host",      "smtp.gmail.com",
                        "puertoTLS", 587,
                        "ssl",       false,
                        "starttls",  true,
                        "nota",      "Requiere contraseña de aplicación (activa 2FA en tu cuenta Google)"
                ),
                Map.of(
                        "proveedor", "CUSTOM",
                        "nombre",    "Servidor personalizado",
                        "host",      "",
                        "puertoTLS", 587,
                        "ssl",       false,
                        "starttls",  true,
                        "nota",      "Configura manualmente según tu proveedor SMTP"
                )
        );
    }

    // Solo Gmail detectado, el resto es CUSTOM
    private String detectarProveedor(String host) {
        if (host == null) return "CUSTOM";
        return host.toLowerCase().contains("gmail") ? "GMAIL" : "CUSTOM";
    }

    // Método auxiliar para no repetir lógica SSL/STARTTLS
    private void ajustarSslPorPuerto(ConfiguracionCorreo config, Integer puerto) {
        if (puerto == null) return;
        if (puerto == 465) {
            config.setSslHabilitado(true);
            config.setStarttlsHabilitado(false);
        } else if (puerto == 587) {
            config.setSslHabilitado(false);
            config.setStarttlsHabilitado(true);
        }
    }
}