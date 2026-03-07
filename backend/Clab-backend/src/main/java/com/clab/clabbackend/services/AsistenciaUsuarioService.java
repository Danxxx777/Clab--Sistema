package com.clab.clabbackend.services;

import com.clab.clabbackend.repository.AsistenciaUsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AsistenciaUsuarioService {

    private final AsistenciaUsuarioRepository asistenciaUsuarioRepository;

    public AsistenciaUsuarioService(AsistenciaUsuarioRepository asistenciaUsuarioRepository) {
        this.asistenciaUsuarioRepository = asistenciaUsuarioRepository;
    }

    public List<Map<String, Object>> listarReservasHoy() {
        List<Object[]> rows = asistenciaUsuarioRepository.listarReservasHoy();
        return rows.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("idReserva",          r[0]);
            map.put("nombreLaboratorio",  r[1]);
            map.put("nombreUsuario",      r[2]);
            map.put("idUsuario",          r[3]);
            map.put("horaInicio",         r[4] != null ? r[4].toString() : null);
            map.put("horaFin",            r[5] != null ? r[5].toString() : null);
            map.put("nombreAsignatura",   r[6]);
            map.put("numeroEstudiantes",  r[7]);
            map.put("asistio",            r[8]);
            map.put("estado",             r[9]);
            return map;
        }).toList();
    }

    @Transactional
    public void registrarAsistencia(Integer idReserva, Integer idUsuario, String observaciones) {
        String horaApertura = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
        asistenciaUsuarioRepository.registrarAsistencia(idReserva, idUsuario, horaApertura, observaciones);
        asistenciaUsuarioRepository.verificarBloqueo(idUsuario);
    }

    public Boolean usuarioBloqueado(Integer idUsuario) {
        return asistenciaUsuarioRepository.usuarioBloqueado(idUsuario);
    }

    public void verificarBloqueo(Integer idUsuario) {
        asistenciaUsuarioRepository.verificarBloqueo(idUsuario);
    }

    @Transactional
    public void registrarFalta(Integer idReserva, Integer idUsuario) {
        asistenciaUsuarioRepository.registrarFalta(idReserva, idUsuario);
        asistenciaUsuarioRepository.verificarBloqueo(idUsuario);
    }
}