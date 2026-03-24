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
import org.springframework.transaction.annotation.Propagation;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Map;

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


    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrar(Integer idUsuario, String usuario, String accion,
                          String modulo, String tablaAfectada,
                          Integer idRegistro, String descripcion,
                          String ip, String resultado) {
        try {
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
        } catch (Exception e) {
            // BD vacía — procedure no existe aún
        }
    }


    public void registrarExito(Integer idUsuario, String usuario, String accion,
                               String modulo, String tabla, Integer idRegistro,
                               String descripcion, String ip) {
        registrar(idUsuario, usuario, accion, modulo, tabla, idRegistro, descripcion, ip, "EXITOSO");
    }


    public void registrarFallo(Integer idUsuario, String usuario, String accion,
                               String modulo, String descripcion, String ip) {
        registrar(idUsuario, usuario, accion, modulo, "N/A", null, descripcion, ip, "FALLIDO");
    }

    // ─── SESIONES via SP ─────────────────────────────────────────────────────


    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrarSesion(Integer idUsuario, String usuario,
                                String token, String ip, LocalDateTime expira) {
        try {
            entityManager.createNativeQuery(
                            "CALL usuarios.sp_registrar_sesion(:idUsuario, :usuario, :tokenHash, :ip, :expira)"
                    )
                    .setParameter("idUsuario",  idUsuario)
                    .setParameter("usuario",    usuario)
                    .setParameter("tokenHash",  hashToken(token))
                    .setParameter("ip",         ip)
                    .setParameter("expira",     expira)
                    .executeUpdate();
        } catch (Exception e) {
            // BD vacía — procedure no existe aún
        }
    }

    public void cerrarSesion(String token, Integer idUsuario, String ip) {
        try {
            entityManager.createNativeQuery(
                            "CALL usuarios.sp_cerrar_sesion(:tokenHash, :idUsuario, :ip)"
                    )
                    .setParameter("tokenHash",  hashToken(token))
                    .setParameter("idUsuario",  idUsuario)
                    .setParameter("ip",         ip)
                    .executeUpdate();
        } catch (Exception e) {
            // BD vacía — procedure no existe aún
        }
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
    public void limpiarSesionesExpiradas() {
        try {
            entityManager.createNativeQuery("CALL usuarios.sp_expirar_sesiones()").executeUpdate();
        } catch (Exception e) {
            // BD vacía — procedure no existe aún
        }
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
        // Normalizar IPv6 loopback
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) return "127.0.0.1";
        if (ip.startsWith("::ffff:")) ip = ip.substring(7);
        return ip.length() > 45 ? ip.substring(0, 45) : ip;
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

    // ─── ESTADÍSTICAS BD EN TIEMPO REAL ──────────────────────────────────────────
    public Map<String, Object> obtenerStatsBD() {
        Map<String, Object> stats = new java.util.LinkedHashMap<>();

        // Conexiones activas
        List<?> conexiones = entityManager.createNativeQuery(
                "SELECT pid, usename, client_addr, state, LEFT(query, 100) as query, " +
                        "CAST(EXTRACT(EPOCH FROM (now() - query_start)) AS int) as duracion_seg " +
                        "FROM pg_stat_activity " +
                        "WHERE datname = current_database() AND state IN ('active', 'idle in transaction', 'idle in transaction (aborted)') AND pid <> pg_backend_pid()"
        ).getResultList();
        stats.put("conexionesActivas", conexiones);

        // Stats de la BD (transacciones, cache)
        Object[] dbStats = (Object[]) entityManager.createNativeQuery(
                "SELECT xact_commit, xact_rollback, blks_hit, blks_read, " +
                        "CASE WHEN (blks_hit + blks_read) = 0 THEN 100 " +
                        "ELSE ROUND(CAST(blks_hit AS numeric) * 100.0 / (blks_hit + blks_read), 2) END as cache_hit_ratio " +
                        "FROM pg_stat_database WHERE datname = current_database()"
        ).getSingleResult();
        stats.put("transaccionesCommit", dbStats[0]);
        stats.put("transaccionesRollback", dbStats[1]);
        stats.put("cacheHitRatio", dbStats[4]);

        // Tablas más activas
        List<?> tablas = entityManager.createNativeQuery(
                "SELECT schemaname, relname, n_tup_ins, n_tup_upd, n_tup_del, n_live_tup, " +
                        "pg_size_pretty(pg_total_relation_size(relid)) as tamanio " +
                        "FROM pg_stat_user_tables " +
                        "ORDER BY (n_tup_ins + n_tup_upd + n_tup_del) DESC LIMIT 10"
        ).getResultList();
        stats.put("tablasActivas", tablas);

        // Locks activos
        List<?> locks = entityManager.createNativeQuery(
                "SELECT pl.pid, pa.usename, CAST(pl.relation AS text) as tabla, pl.mode, pl.granted " +
                        "FROM pg_locks pl " +
                        "JOIN pg_stat_activity pa ON pl.pid = pa.pid " +
                        "WHERE pl.relation IS NOT NULL AND pa.datname = current_database()"
        ).getResultList();
        stats.put("bloqueos", locks);
        // Historial de queries más ejecutadas (pg_stat_statements)
        try {
            List<?> historial = entityManager.createNativeQuery(
                    "SELECT LEFT(query, 120) as query, calls, " +
                            "ROUND(CAST(total_exec_time AS numeric), 2) as total_ms, " +
                            "ROUND(CAST(mean_exec_time AS numeric), 2) as promedio_ms, rows " +
                            "FROM pg_stat_statements " +
                            "WHERE query NOT LIKE '%pg_stat%' " +
                            "ORDER BY total_exec_time DESC LIMIT 10"
            ).getResultList();
            stats.put("historialQueries", historial);
        } catch (Exception e) {
            stats.put("historialQueries", List.of());
        }
        return stats;
    }
}