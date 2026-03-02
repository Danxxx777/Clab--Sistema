package com.clab.clabbackend.services;

import com.clab.clabbackend.entities.ConfiguracionCorreo;
import com.clab.clabbackend.repository.ConfiguracionCorreoRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ConfiguracionCorreoService {

    private final ConfiguracionCorreoRepository repo;

    public ConfiguracionCorreoService(ConfiguracionCorreoRepository repo) {
        this.repo = repo;
    }

    // Obtener por propósito con fallback a GENERAL
    public ConfiguracionCorreo obtenerPorProposito(String proposito) {
        return repo.findFirstByPropositoAndActivoTrue(proposito)
                .orElseGet(() -> repo.findFirstByPropositoAndActivoTrue("GENERAL")
                        .orElseThrow(() -> new RuntimeException("No hay configuración de correo activa")));
    }

    // Listar todos
    public List<ConfiguracionCorreo> listar() {
        return repo.findAllByOrderByIdConfigAsc();
    }

    // Crear nuevo
    public ConfiguracionCorreo crear(ConfiguracionCorreo config) {
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
        actual.setPasswordRemitente(nueva.getPasswordRemitente());
        actual.setNombreRemitente(nueva.getNombreRemitente());
        actual.setAuthHabilitado(nueva.getAuthHabilitado());
        actual.setStarttlsHabilitado(nueva.getStarttlsHabilitado());
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
}