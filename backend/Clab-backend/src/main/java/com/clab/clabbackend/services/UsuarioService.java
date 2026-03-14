package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.UsuarioRequestDTO;
import com.clab.clabbackend.dto.UsuarioResponseDTO;
import com.clab.clabbackend.entities.Usuario;
import com.clab.clabbackend.repository.UsuarioRepository;
import com.clab.clabbackend.repository.UsuarioRolRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EntityManager entityManager;
    private final UsuarioRolRepository usuarioRolRepository;
    private final NotificacionService notificacionService;
    private final EmailService emailService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          EntityManager entityManager,
                          UsuarioRolRepository usuarioRolRepository,
                          NotificacionService notificacionService,
                          EmailService emailService,
                          org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.entityManager = entityManager;
        this.usuarioRolRepository = usuarioRolRepository;
        this.notificacionService = notificacionService;
        this.emailService = emailService;
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

        // 1. Generar contraseña aleatoria segura
        String contraseniaPlain = generarContrasenia();
        String contraseniaHash  = passwordEncoder.encode(contraseniaPlain);

        // 2. Llamar al SP
        Object result = entityManager.createNativeQuery(
                        "SELECT usuarios.sp_crear_usuario(" +
                                ":identidad, :nombres, :apellidos, :email, :telefono, :usuario, " +
                                ":contraseniaHash, CAST(:idsRoles AS integer[]), :actorId, :actorUsuario, :ip)"
                )
                .setParameter("identidad",       dto.getIdentidad())
                .setParameter("nombres",         dto.getNombres())
                .setParameter("apellidos",       dto.getApellidos())
                .setParameter("email",           dto.getEmail())
                .setParameter("telefono",        dto.getTelefono())
                .setParameter("usuario",         dto.getUsuario())
                .setParameter("contraseniaHash", contraseniaHash)
                .setParameter("idsRoles",        idsRolesArray(dto))
                .setParameter("actorId",         actorId)
                .setParameter("actorUsuario",    actorUsuario)
                .setParameter("ip",              ip)
                .getSingleResult();

        Integer idGenerado = ((Number) result).intValue();

        // 3. Cargar el usuario creado
        UsuarioResponseDTO response = usuarioRepository.findById(idGenerado)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Usuario creado pero no encontrado"));

        // 4. Enviar email con credenciales al nuevo usuario
        try {
            String nombreCompleto = dto.getNombres() + " " + dto.getApellidos();
            String asunto = "Bienvenido a CLAB — Tus credenciales de acceso";
            String html = buildEmailCredenciales(nombreCompleto, dto.getUsuario(), contraseniaPlain);
            emailService.enviarCorreo("BIENVENIDA", dto.getEmail(), asunto, html);
        } catch (Exception e) {
            System.err.println("Error enviando email de bienvenida: " + e.getMessage());
        }

        // 5. Notificar a administradores del nuevo usuario
        try {
            String nombreCompleto = dto.getNombres() + " " + dto.getApellidos();
            usuarioRolRepository.findUsuariosByRolNombre("Administradorr")
                    .forEach(admin ->
                            notificacionService.notificarAdminUsuarioNuevo(admin, nombreCompleto)
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

    // ─── ACTIVAR via SP ───────────────────────────────────────────────────────
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

    // ─── OBTENER POR ID ───────────────────────────────────────────────────────
    public UsuarioResponseDTO obtenerPorId(Integer id) {
        return usuarioRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    // ─── GENERAR CONTRASEÑA ALEATORIA ─────────────────────────────────────────
    private String generarContrasenia() {
        String mayusculas = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        String minusculas = "abcdefghijkmnpqrstuvwxyz";
        String numeros    = "23456789";
        String especiales = "@#$%&*!";
        String todos      = mayusculas + minusculas + numeros + especiales;

        SecureRandom rnd = new SecureRandom();
        StringBuilder sb = new StringBuilder();

        // Garantizar al menos 1 de cada tipo
        sb.append(mayusculas.charAt(rnd.nextInt(mayusculas.length())));
        sb.append(minusculas.charAt(rnd.nextInt(minusculas.length())));
        sb.append(numeros.charAt(rnd.nextInt(numeros.length())));
        sb.append(especiales.charAt(rnd.nextInt(especiales.length())));

        // Completar hasta 10 caracteres
        for (int i = 4; i < 10; i++) {
            sb.append(todos.charAt(rnd.nextInt(todos.length())));
        }

        // Mezclar
        char[] chars = sb.toString().toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = rnd.nextInt(i + 1);
            char tmp = chars[i]; chars[i] = chars[j]; chars[j] = tmp;
        }
        return new String(chars);
    }

    // ─── EMAIL DE BIENVENIDA ──────────────────────────────────────────────────
    private String buildEmailCredenciales(String nombreCompleto, String usuario, String contrasenia) {
        return "<div style='font-family:Arial,sans-serif;padding:24px;max-width:520px;background:#f9f9f9;border-radius:10px;'>" +
                "<h2 style='color:#39ff14;background:#111;padding:16px 20px;border-radius:8px;letter-spacing:3px;margin:0 0 20px;'>CLAB</h2>" +
                "<h3 style='color:#222;'>¡Bienvenido, " + nombreCompleto + "!</h3>" +
                "<p style='color:#444;'>Tu cuenta en el <b>Sistema de Gestión de Laboratorios</b> ha sido creada. " +
                "Aquí están tus credenciales de acceso:</p>" +
                "<div style='background:#fff;border:1px solid #ddd;border-radius:8px;padding:16px 20px;margin:16px 0;'>" +
                "<p style='margin:6px 0;'><b>Usuario:</b> <span style='color:#1a1a1a;font-family:monospace;font-size:15px;'>" + usuario + "</span></p>" +
                "<p style='margin:6px 0;'><b>Contraseña temporal:</b> <span style='color:#e74c3c;font-family:monospace;font-size:15px;letter-spacing:2px;'>" + contrasenia + "</span></p>" +
                "</div>" +
                "<div style='background:#fff8e1;border-left:4px solid #f39c12;padding:12px 16px;border-radius:4px;margin-bottom:16px;'>" +
                "<b>⚠️ Importante:</b> Por seguridad, debes cambiar tu contraseña en tu primer inicio de sesión." +
                "</div>" +
                "<hr style='border:none;border-top:1px solid #eee;margin:16px 0;'>" +
                "<small style='color:#999;'>Sistema de Gestión de Laboratorios — CLAB · Este es un mensaje automático.</small>" +
                "</div>";
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
}