package com.clab.clabbackend.services.usuarios;

import com.clab.clabbackend.dto.usuarios.SolicitudAccesoDTO;
import com.clab.clabbackend.entities.usuarios.SolicitudAcceso;
import com.clab.clabbackend.repository.usuarios.SolicitudAccesoRepository;
import com.clab.clabbackend.services.EmailService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SolicitudAccesoService {

    private final SolicitudAccesoRepository repo;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;   // ← interfaz, no BCrypt directo

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Map<String, Object> crearSolicitud(SolicitudAccesoDTO dto) {
        List<?> result = em.createNativeQuery(
                        "CALL usuarios.sp_crear_solicitud_acceso(:identidad, :nombres, :apellidos, " +
                                ":email, :telefono, :motivo, :idRolSolicitado, null, null)"
                )
                .setParameter("identidad",        dto.getIdentidad())
                .setParameter("nombres",          dto.getNombres())
                .setParameter("apellidos",        dto.getApellidos())
                .setParameter("email",            dto.getEmail())
                .setParameter("telefono",         dto.getTelefono())
                .setParameter("motivo",           dto.getMotivo())
                .setParameter("idRolSolicitado",  dto.getIdRolSolicitado())
                .getResultList();

        Object[] row = (Object[]) result.get(0);
        Map<String, Object> resp = new HashMap<>();
        resp.put("codigo",  row[0]);
        resp.put("mensaje", row[1]);
        return resp;
    }

    public List<SolicitudAccesoDTO> listarPendientes() {
        return repo.findByEstadoOrderByFechaSolicitudDesc("PENDIENTE")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<SolicitudAccesoDTO> listarTodas() {
        return repo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public long contarPendientes() {
        return repo.countByEstado("PENDIENTE");
    }

    @Transactional
    public Map<String, Object> aprobarSolicitud(Integer idSolicitud, Integer idAdmin, List<Integer> roles) {
        List<?> result = em.createNativeQuery("CALL usuarios.sp_aprobar_solicitud_acceso(:idSolicitud, :idAdmin, :roles, null, null, null, null)")
                .setParameter("idSolicitud", idSolicitud)
                .setParameter("idAdmin",     idAdmin)
                .setParameter("roles",       roles.toArray(new Integer[0]))
                .getResultList();
        Object[] row    = (Object[]) result.get(0);
        int codigo      = (int) row[0];
        String mensaje  = (String) row[1];
        String username = (String) row[2];
        String contrasenia = (String) row[3];
        Map<String, Object> resp = new HashMap<>();
        resp.put("codigo",  codigo);
        resp.put("mensaje", mensaje);

        if (codigo == 1) {
            String hash = passwordEncoder.encode(contrasenia);
            em.createNativeQuery("UPDATE usuarios.u_usuario SET contrasenia = ?1 WHERE usuario = ?2")
                    .setParameter(1, hash)
                    .setParameter(2, username)
                    .executeUpdate();
            try {
                SolicitudAcceso sol = repo.findById(idSolicitud).orElseThrow();
                if (sol.getEmail() != null && !sol.getEmail().isBlank()) {
                    emailService.enviarCredenciales(sol.getEmail(), sol.getNombres(), username, contrasenia);
                }
            } catch (Exception e) {
                System.err.println("Error enviando email credenciales: " + e.getMessage());
            }
        }
        return resp;
    }

    @Transactional
    public Map<String, Object> rechazarSolicitud(Integer idSolicitud, Integer idAdmin, String observacion) {
        List<?> result = em.createNativeQuery(
                        "CALL usuarios.sp_rechazar_solicitud_acceso(:idSolicitud, :idAdmin, :observacion, null, null)"
                )
                .setParameter("idSolicitud",  idSolicitud)
                .setParameter("idAdmin",      idAdmin)
                .setParameter("observacion",  observacion)
                .getResultList();

        Object[] row = (Object[]) result.get(0);

        if ((int) row[0] == 1) {
            try {
                SolicitudAcceso sol = repo.findById(idSolicitud).orElseThrow();
                if (sol.getEmail() != null && !sol.getEmail().isBlank()) {
                    emailService.enviarRechazoSolicitud(sol.getEmail(), sol.getNombres(), observacion);
                }
            } catch (Exception e) {
                System.err.println("Error enviando email rechazo: " + e.getMessage());
            }
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("codigo",  row[0]);
        resp.put("mensaje", row[1]);
        return resp;
    }

    private SolicitudAccesoDTO toDTO(SolicitudAcceso e) {
        SolicitudAccesoDTO d = new SolicitudAccesoDTO();
        d.setId(e.getId());
        d.setIdentidad(e.getIdentidad());
        d.setNombres(e.getNombres());
        d.setApellidos(e.getApellidos());
        d.setEmail(e.getEmail());
        d.setTelefono(e.getTelefono());
        d.setMotivo(e.getMotivo());
        d.setEstado(e.getEstado());
        d.setFechaSolicitud(e.getFechaSolicitud());
        d.setFechaResolucion(e.getFechaResolucion());
        d.setIdAdminResolvio(e.getIdAdminResolvio());
        d.setObservacionRechazo(e.getObservacionRechazo());
        d.setIdRolSolicitado(e.getIdRolSolicitado());
        return d;
    }
}