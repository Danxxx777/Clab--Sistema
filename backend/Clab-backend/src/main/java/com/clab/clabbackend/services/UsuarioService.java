package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.UsuarioRequestDTO;
import com.clab.clabbackend.dto.UsuarioResponseDTO;
import com.clab.clabbackend.entities.Usuario;
import com.clab.clabbackend.repository.UsuarioRepository;
import com.clab.clabbackend.repository.UsuarioRolRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EntityManager entityManager;
    private final UsuarioRolRepository usuarioRolRepository;
    private final NotificacionService notificacionService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          EntityManager entityManager,
                          UsuarioRolRepository usuarioRolRepository,
                          NotificacionService notificacionService,
                          org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.entityManager = entityManager;
        this.usuarioRolRepository = usuarioRolRepository;
        this.notificacionService = notificacionService;
        this.passwordEncoder = passwordEncoder;
    }

    // ─── LISTAR ──────────────────────────────────────────────────────────────
    public List<UsuarioResponseDTO> listar() {
        return usuarioRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    // ─── CREAR via SP ─────────────────────────────────────────────────────────
    @Transactional
    public UsuarioResponseDTO crear(UsuarioRequestDTO dto,
                                    Integer actorId, String actorUsuario, String ip) {
        Object result = entityManager.createNativeQuery(
                        "SELECT usuarios.fn_crear_usuario(:identidad, :nombres, :apellidos, :email, " +
                                ":telefono, :usuario, :contrasenia, CAST(:idsRoles AS integer[]), :actorId, :actorUsuario, :ip)"
                )
                .setParameter("identidad",    dto.getIdentidad())
                .setParameter("nombres",      dto.getNombres())
                .setParameter("apellidos",    dto.getApellidos())
                .setParameter("email",        dto.getEmail())
                .setParameter("telefono",     dto.getTelefono())
                .setParameter("usuario",      dto.getUsuario())
                .setParameter("contrasenia", passwordEncoder.encode(dto.getContrasenia()))
                .setParameter("idsRoles",     idsRolesArray(dto))
                .setParameter("actorId",      actorId)
                .setParameter("actorUsuario", actorUsuario)
                .setParameter("ip",           ip)
                .getSingleResult();

        Integer idGenerado = ((Number) result).intValue();
        UsuarioResponseDTO response = usuarioRepository.findById(idGenerado)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Usuario creado pero no encontrado"));

        //  Notificar a todos los Administradores del nuevo usuario
        try {
            String nombreCompleto = dto.getNombres() + " " + dto.getApellidos();
            usuarioRolRepository.findUsuariosByRolNombre("Administradorr")
                    .forEach(admin ->
                            notificacionService.notificarAdminUsuarioNuevo(
                                    admin, nombreCompleto)
                    );
        } catch (Exception e) {
            System.err.println("Error notificación nuevo usuario: " + e.getMessage());
        }

        return response;
    }

    // ─── ACTUALIZAR via SP ────────────────────────────────────────────────────
    @Transactional
    public UsuarioResponseDTO actualizar(Integer id, UsuarioRequestDTO dto,
                                         Integer actorId, String actorUsuario, String ip) {
        entityManager.createNativeQuery(
                        "CALL usuarios.sp_actualizar_usuario(:idUsuario, :identidad, :nombres, :apellidos, " +
                                ":email, :telefono, :usuario, CAST(:idsRoles AS integer[]), :actorId, :actorUsuario, :ip)"
                )
                .setParameter("idUsuario",    id)
                .setParameter("identidad",    dto.getIdentidad())
                .setParameter("nombres",      dto.getNombres())
                .setParameter("apellidos",    dto.getApellidos())
                .setParameter("email",        dto.getEmail())
                .setParameter("telefono",     dto.getTelefono())
                .setParameter("usuario",      dto.getUsuario())
                .setParameter("idsRoles",     idsRolesArray(dto))
                .setParameter("actorId",      actorId)
                .setParameter("actorUsuario", actorUsuario)
                .setParameter("ip",           ip)
                .executeUpdate();

        return usuarioRepository.findById(id).map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    // ─── DESACTIVAR via SP ────────────────────────────────────────────────────
    @Transactional
    public void desactivar(Integer id, Integer actorId, String actorUsuario, String ip) {
        entityManager.createNativeQuery(
                        "CALL usuarios.sp_desactivar_usuario(:idUsuario, :actorId, :actorUsuario, :ip)"
                )
                .setParameter("idUsuario",    id)
                .setParameter("actorId",      actorId)
                .setParameter("actorUsuario", actorUsuario)
                .setParameter("ip",           ip)
                .executeUpdate();
    }
    // ─── CAMBIAR CONTRASEÑA via SP ────────────────────────────────────────────
    @Transactional
    public void cambiarContrasenia(Integer idUsuario, String contraseniaActual,
                                   String contraseniaNueva,
                                   Integer actorId, String actorUsuario, String ip) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(contraseniaActual, usuario.getContrasenia())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }

        String hashNueva = passwordEncoder.encode(contraseniaNueva);

        entityManager.createNativeQuery(
                        "CALL usuarios.sp_cambiar_contrasenia(:idUsuario, :contrasenia, :actorId, :actorUsuario, :ip)"
                )
                .setParameter("idUsuario",    idUsuario)
                .setParameter("contrasenia",  hashNueva)
                .setParameter("actorId",      actorId)
                .setParameter("actorUsuario", actorUsuario)
                .setParameter("ip",           ip)
                .executeUpdate();
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────
    private String idsRolesArray(UsuarioRequestDTO dto) {
        if (dto.getIdsRoles() == null || dto.getIdsRoles().isEmpty()) return "{}";
        return "{" + dto.getIdsRoles().stream()
                .map(String::valueOf)
                .reduce((a, b) -> a + "," + b)
                .orElse("") + "}";
    }

    private UsuarioResponseDTO toDTO(Usuario u) {
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setIdUsuario(u.getIdUsuario());
        dto.setIdentidad(u.getIdentidad());
        dto.setNombres(u.getNombres());
        dto.setApellidos(u.getApellidos());
        dto.setEmail(u.getEmail());
        dto.setTelefono(u.getTelefono());
        dto.setUsuario(u.getUsuario());
        dto.setEstado(u.getEstado());
        dto.setFechaRegistro(u.getFechaRegistro());

        var rolesVigentes = usuarioRolRepository.findAllByUsuario_IdUsuarioAndVigenteTrue(u.getIdUsuario());
        String todosLosRoles = rolesVigentes.stream()
                .map(ur -> ur.getRol().getNombreRol())
                .collect(java.util.stream.Collectors.joining(", "));
        dto.setRol(todosLosRoles);
        dto.setRoles(rolesVigentes.stream()
                .map(ur -> new UsuarioResponseDTO.RolInfo(
                        ur.getRol().getIdRol(),
                        ur.getRol().getNombreRol()
                ))
                .toList());
        return dto;
    }
    public UsuarioResponseDTO obtenerPorId(Integer id) {
        return usuarioRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
    @Transactional
    public void activar(Integer id, Integer actorId, String actorUsuario, String ip) {
        entityManager.createNativeQuery(
                        "CALL usuarios.sp_activar_usuario(:idUsuario, :actorId, :actorUsuario, :ip)"
                )
                .setParameter("idUsuario",    id)
                .setParameter("actorId",      actorId)
                .setParameter("actorUsuario", actorUsuario)
                .setParameter("ip",           ip)
                .executeUpdate();
    }
}