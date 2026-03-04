package com.clab.clabbackend.services;

import com.clab.clabbackend.entities.Auditoria;
import com.clab.clabbackend.entities.SesionActiva;
import com.clab.clabbackend.repository.AuditoriaRepository;
import com.clab.clabbackend.repository.SesionActivaRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
public class AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;
    private final SesionActivaRepository sesionActivaRepository;

    public AuditoriaService(AuditoriaRepository auditoriaRepository,
                            SesionActivaRepository sesionActivaRepository) {
        this.auditoriaRepository = auditoriaRepository;
        this.sesionActivaRepository = sesionActivaRepository;
    }

    // ─── AUDITORÍA ────────────────────────────────────────────────

    public void registrar(Integer idUsuario, String usuario, String accion,
                          String modulo, String tablaAfectada,
                          Integer idRegistroAfectado, String descripcion,
                          String ip, String resultado) {
        Auditoria a = new Auditoria();
        a.setIdUsuario(idUsuario);
        a.setUsuario(usuario);
        a.setAccion(accion);
        a.setModulo(modulo);
        a.setTablaAfectada(tablaAfectada);
        a.setIdRegistroAfectado(idRegistroAfectado);
        a.setDescripcion(descripcion);
        a.setIp(ip);
        a.setResultado(resultado != null ? resultado : "EXITOSO");
        a.setFechaHora(LocalDateTime.now());
        auditoriaRepository.save(a);
    }

    // Versión simplificada para acciones exitosas
    public void registrarExito(Integer idUsuario, String usuario, String accion,
                               String modulo, String tablaAfectada,
                               Integer idRegistroAfectado, String descripcion, String ip) {
        registrar(idUsuario, usuario, accion, modulo, tablaAfectada,
                idRegistroAfectado, descripcion, ip, "EXITOSO");
    }

    // Para accesos denegados o errores
    public void registrarFallo(Integer idUsuario, String usuario, String accion,
                               String modulo, String descripcion, String ip) {
        registrar(idUsuario, usuario, accion, modulo, null,
                null, descripcion, ip, "FALLIDO");
    }

    public List<Auditoria> listarTodo() {
        return auditoriaRepository.findAllByOrderByFechaHoraDesc();
    }

    public List<Auditoria> listarPorUsuario(Integer idUsuario) {
        return auditoriaRepository.findByIdUsuarioOrderByFechaHoraDesc(idUsuario);
    }

    public List<Auditoria> listarPorModulo(String modulo) {
        return auditoriaRepository.findByModuloOrderByFechaHoraDesc(modulo);
    }

    // ─── SESIONES ACTIVAS ─────────────────────────────────────────

    public void registrarSesion(Integer idUsuario, String usuario,
                                String token, String ip, LocalDateTime expira) {
        // Invalidar sesiones anteriores del mismo usuario
        List<SesionActiva> sesionesAnteriores =
                sesionActivaRepository.findByIdUsuarioAndActivaTrue(idUsuario);
        sesionesAnteriores.forEach(s -> s.setActiva(false));
        sesionActivaRepository.saveAll(sesionesAnteriores);

        SesionActiva sesion = new SesionActiva();
        sesion.setIdUsuario(idUsuario);
        sesion.setUsuario(usuario);
        sesion.setTokenHash(hashToken(token));
        sesion.setIp(ip);
        sesion.setFechaInicio(LocalDateTime.now());
        sesion.setFechaExpira(expira);
        sesion.setActiva(true);
        sesionActivaRepository.save(sesion);
    }

    public void cerrarSesion(String token) {
        sesionActivaRepository.findByTokenHash(hashToken(token))
                .ifPresent(s -> {
                    s.setActiva(false);
                    sesionActivaRepository.save(s);
                });
    }

    public List<SesionActiva> listarSesionesActivas() {
        return sesionActivaRepository.findByActivaTrueOrderByFechaInicioDesc();
    }

    // Expira sesiones vencidas cada 5 minutos
    @Scheduled(fixedRate = 300000)
    public void limpiarSesionesExpiradas() {
        sesionActivaRepository.expirarSesionesVencidas(LocalDateTime.now());
    }

    // ─── UTILIDADES ──────────────────────────────────────────────

    public String obtenerIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            return token.substring(0, Math.min(token.length(), 255));
        }
    }
}