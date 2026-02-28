package com.clab.clabbackend.services;

import com.clab.clabbackend.entities.ConfiguracionCorreo;
import com.clab.clabbackend.repository.ConfiguracionCorreoRepository;
import org.springframework.stereotype.Service;

@Service
public class ConfiguracionCorreoService {

    private final ConfiguracionCorreoRepository repo;

    public ConfiguracionCorreoService(ConfiguracionCorreoRepository repo) {
        this.repo = repo;
    }

    public ConfiguracionCorreo obtener() {
        return repo.findFirstByActivoTrue()
                .orElseThrow(() -> new RuntimeException("No hay configuración de correo activa"));
    }

    public ConfiguracionCorreo guardar(ConfiguracionCorreo config) {
        // Si hay una config activa, la desactiva primero
        repo.findFirstByActivoTrue().ifPresent(c -> {
            c.setActivo(false);
            repo.save(c);
        });
        config.setActivo(true);
        return repo.save(config);
    }

    public ConfiguracionCorreo actualizar(Integer id, ConfiguracionCorreo nueva) {
        ConfiguracionCorreo actual = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Configuración no encontrada"));
        actual.setHost(nueva.getHost());
        actual.setPuerto(nueva.getPuerto());
        actual.setEmailRemitente(nueva.getEmailRemitente());
        actual.setPasswordRemitente(nueva.getPasswordRemitente());
        actual.setNombreRemitente(nueva.getNombreRemitente());
        actual.setAuthHabilitado(nueva.getAuthHabilitado());
        actual.setStarttlsHabilitado(nueva.getStarttlsHabilitado());
        return repo.save(actual);
    }
}