package com.clab.clabbackend.services;

import com.clab.clabbackend.entities.Auditoria;
import com.clab.clabbackend.entities.SesionActiva;
import com.clab.clabbackend.repository.AuditoriaRepository;
import com.clab.clabbackend.repository.SesionActivaRepository;
import jakarta.persistence.EntityManager;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
public class AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;
    private final SesionActivaRepository sesionActivaRepository;
    private final EntityManager entityManager;

    public AuditoriaService(AuditoriaRepository auditoriaRepository,
                            SesionActivaRepository sesionActivaRepository,
                            EntityManager entityManager) {
        this.auditoriaRepository = auditoriaRepository;
        this.sesionActivaRepository = sesionActivaRepository;
        this.entityManager = entityManager;
    }

    // ─── AUDITORÍA via SP ────────────────────────────────────────────────────

    @Transactional
    public void registrar(Integer idUsuario, String usuario, String accion,
                          String modulo, String tablaAfectada,
                          Integer idRegistro, String descripcion,
                          String ip, String resultado) {
        entityManager.createNativeQuery(
                        "CALL usuarios.sp_registrar_auditoria(:idUsuario, :usuario, :accion, :modulo, " +
                                ":tabla, :idRegistro, :descripcion, :ip, :resultado)"
                )
                .setParameter("idUsuario",   idUsuario)
                .setParameter("usuario",     usuario)
                .setParameter("accion",      accion)
                .setParameter("modulo",      modulo)
                .setParameter("tabla",       tablaAfectada)
                .setParameter("idRegistro",  idRegistro)
                .setParameter("descripcion", descripcion)
                .setParameter("ip",          ip)
                .setParameter("resultado",   resultado != null ? resultado : "EXITOSO")
                .executeUpdate();
    }

    @Transactional
    public void registrarExito(Integer idUsuario, String usuario, String accion,
                               String modulo, String tabla, Integer idRegistro,
                               String descripcion, String ip) {
        registrar(idUsuario, usuario, accion, modulo, tabla, idRegistro, descripcion, ip, "EXITOSO");
    }

    @Transactional
    public void registrarFallo(Integer idUsuario, String usuario, String accion,
                               String modulo, String descripcion, String ip) {
        registrar(idUsuario, usuario, accion, modulo, "N/A", null, descripcion, ip, "FALLIDO");
    }

    // ─── SESIONES via SP ─────────────────────────────────────────────────────

    @Transactional
    public void registrarSesion(Integer idUsuario, String usuario,
                                String token, String ip, LocalDateTime expira) {
        entityManager.createNativeQuery(
                        "CALL usuarios.sp_registrar_sesion(:idUsuario, :usuario, :tokenHash, :ip, :expira)"
                )
                .setParameter("idUsuario",  idUsuario)
                .setParameter("usuario",    usuario)
                .setParameter("tokenHash",  hashToken(token))
                .setParameter("ip",         ip)
                .setParameter("expira",     expira)
                .executeUpdate();
    }

    @Transactional
    public void cerrarSesion(String token, Integer idUsuario, String ip) {
        entityManager.createNativeQuery(
                        "CALL usuarios.sp_cerrar_sesion(:tokenHash, :idUsuario, :ip)"
                )
                .setParameter("tokenHash",  hashToken(token))
                .setParameter("idUsuario",  idUsuario)
                .setParameter("ip",         ip)
                .executeUpdate();
    }

    @Transactional
    public void forzarLogout(Integer idUsuarioTarget, Integer actorId, String actorUsuario, String ip) {
        entityManager.createNativeQuery(
                        "CALL usuarios.sp_forzar_logout(:idTarget, :actorId, :actorUsuario, :ip)"
                )
                .setParameter("idTarget",      idUsuarioTarget)
                .setParameter("actorId",       actorId)
                .setParameter("actorUsuario",  actorUsuario)
                .setParameter("ip",            ip)
                .executeUpdate();
    }

    @Scheduled(fixedRate = 300000)
    @Transactional
    public void limpiarSesionesExpiradas() {
        entityManager.createNativeQuery("CALL usuarios.sp_expirar_sesiones()").executeUpdate();
    }

    // ─── CONSULTAS ───────────────────────────────────────────────────────────

    public List<Auditoria> listarTodo() {
        return auditoriaRepository.findAllByOrderByFechaHoraDesc();
    }

    public List<Auditoria> listarPorUsuario(Integer idUsuario) {
        return auditoriaRepository.findByIdUsuarioOrderByFechaHoraDesc(idUsuario);
    }

    public List<Auditoria> listarPorModulo(String modulo) {
        return auditoriaRepository.findByModuloOrderByFechaHoraDesc(modulo);
    }

    public List<SesionActiva> listarSesionesActivas() {
        return sesionActivaRepository.findByActivaTrueOrderByFechaInicioDesc();
    }

    // ─── UTILIDADES ──────────────────────────────────────────────────────────

    public String obtenerIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) ip = request.getRemoteAddr();
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