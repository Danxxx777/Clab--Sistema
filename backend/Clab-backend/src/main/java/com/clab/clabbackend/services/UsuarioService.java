package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.UsuarioRequestDTO;
import com.clab.clabbackend.dto.UsuarioResponseDTO;
import com.clab.clabbackend.entities.Usuario;
import com.clab.clabbackend.repository.UsuarioRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EntityManager entityManager;

    public UsuarioService(UsuarioRepository usuarioRepository, EntityManager entityManager) {
        this.usuarioRepository = usuarioRepository;
        this.entityManager = entityManager;
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
        // Usamos función wrapper que retorna el id generado
        Object result = entityManager.createNativeQuery(
                        "SELECT usuarios.fn_crear_usuario(:identidad, :nombres, :apellidos, :email, " +
                                ":telefono, :usuario, :contrasenia, :idsRoles::integer[], :actorId, :actorUsuario, :ip)"
                )
                .setParameter("identidad",    dto.getIdentidad())
                .setParameter("nombres",      dto.getNombres())
                .setParameter("apellidos",    dto.getApellidos())
                .setParameter("email",        dto.getEmail())
                .setParameter("telefono",     dto.getTelefono())
                .setParameter("usuario",      dto.getUsuario())
                .setParameter("contrasenia",  dto.getContrasenia())
                .setParameter("idsRoles",     idsRolesArray(dto))
                .setParameter("actorId",      actorId)
                .setParameter("actorUsuario", actorUsuario)
                .setParameter("ip",           ip)
                .getSingleResult();

        Integer idGenerado = ((Number) result).intValue();
        return usuarioRepository.findById(idGenerado).map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Usuario creado pero no encontrado"));
    }

    // ─── ACTUALIZAR via SP ────────────────────────────────────────────────────
    @Transactional
    public UsuarioResponseDTO actualizar(Integer id, UsuarioRequestDTO dto,
                                         Integer actorId, String actorUsuario, String ip) {
        entityManager.createNativeQuery(
                        "CALL usuarios.sp_actualizar_usuario(:idUsuario, :identidad, :nombres, :apellidos, " +
                                ":email, :telefono, :usuario, :idsRoles::integer[], :actorId, :actorUsuario, :ip)"
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
        return dto;
    }
}