package com.clab.clabbackend.services;

import com.clab.clabbackend.repository.BloqueoUsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BloqueoUsuarioService {

    private final BloqueoUsuarioRepository bloqueoUsuarioRepository;

    public BloqueoUsuarioService(BloqueoUsuarioRepository bloqueoUsuarioRepository) {
        this.bloqueoUsuarioRepository = bloqueoUsuarioRepository;
    }

    public List<Map<String, Object>> listarBloqueados() {
        List<Object[]> rows = bloqueoUsuarioRepository.listarBloqueados();
        return rows.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("idBloqueo",     r[0]);
            map.put("idUsuario",     r[1]);
            map.put("nombreUsuario", r[2]);
            map.put("motivo",        r[3]);
            map.put("fechaBloqueo",  r[4] != null ? r[4].toString() : null);
            map.put("activo",        r[5]);
            return map;
        }).toList();
    }

    @Transactional
    public void desbloquearUsuario(Integer idUsuario) {
        bloqueoUsuarioRepository.desbloquearUsuario(idUsuario);
    }
}