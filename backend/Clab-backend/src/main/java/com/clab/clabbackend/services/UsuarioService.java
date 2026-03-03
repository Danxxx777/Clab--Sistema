package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.UsuarioRequestDTO;
import com.clab.clabbackend.dto.UsuarioResponseDTO;
import com.clab.clabbackend.entities.Usuario;
import com.clab.clabbackend.entities.UsuarioRol;
import com.clab.clabbackend.repository.RolRepository;
import com.clab.clabbackend.repository.UsuarioRepository;
import com.clab.clabbackend.repository.UsuarioRolRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioRolRepository usuarioRolRepository;
    private final RolRepository rolRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            UsuarioRolRepository usuarioRolRepository,
            RolRepository rolRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioRolRepository = usuarioRolRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UsuarioResponseDTO crear(UsuarioRequestDTO dto) {
        String usuarioBd = generarUsuario(dto.getNombres(), dto.getApellidos());
        String passwordSistema = passwordEncoder.encode(dto.getContrasenia());
        String passwordBd = dto.getContrasenia();

        // El SP solo acepta un rol — pasamos el primero
        Integer primerRol = (dto.getIdsRoles() != null && !dto.getIdsRoles().isEmpty())
                ? dto.getIdsRoles().get(0)
                : null;

        usuarioRepository.spUsuarioInsertar(
                dto.getIdentidad(),
                dto.getNombres(),
                dto.getApellidos(),
                dto.getEmail(),
                dto.getTelefono(),
                usuarioBd,
                passwordSistema,
                passwordBd,
                primerRol
        );

        Usuario usuarioCreado = usuarioRepository.findByUsuario(usuarioBd)
                .orElseThrow(() -> new RuntimeException("Error creando usuario"));

        // Asignar roles adicionales (desde el 2do en adelante)
        if (dto.getIdsRoles() != null && dto.getIdsRoles().size() > 1) {
            for (int i = 1; i < dto.getIdsRoles().size(); i++) {
                Integer idRol = dto.getIdsRoles().get(i);
                var rol = rolRepository.findById(idRol)
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + idRol));
                var ur = new UsuarioRol();
                ur.setUsuario(usuarioCreado);
                ur.setRol(rol);
                ur.setFechaAsignacion(LocalDate.now());
                ur.setVigente(true);
                usuarioRolRepository.save(ur);
            }
        }

        return construirResponse(usuarioCreado);
    }

    public UsuarioResponseDTO actualizar(Integer id, UsuarioRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setIdentidad(dto.getIdentidad());
        usuario.setNombres(dto.getNombres());
        usuario.setApellidos(dto.getApellidos());
        usuario.setEmail(dto.getEmail());
        usuario.setTelefono(dto.getTelefono());

        if (dto.getContrasenia() != null && !dto.getContrasenia().isBlank()) {
            usuario.setContrasenia(passwordEncoder.encode(dto.getContrasenia()));
        }

        // Actualizar roles: desactivar todos los vigentes y asignar los nuevos
        if (dto.getIdsRoles() != null && !dto.getIdsRoles().isEmpty()) {
            // Desactivar todos los roles vigentes actuales
            List<UsuarioRol> rolesVigentes = usuarioRolRepository
                    .findAllByUsuario_IdUsuarioAndVigenteTrue(usuario.getIdUsuario());
            rolesVigentes.forEach(ur -> ur.setVigente(false));
            usuarioRolRepository.saveAll(rolesVigentes);

            // Asignar los nuevos roles
            for (Integer idRol : dto.getIdsRoles()) {
                var rol = rolRepository.findById(idRol)
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + idRol));
                var ur = new UsuarioRol();
                ur.setUsuario(usuario);
                ur.setRol(rol);
                ur.setFechaAsignacion(LocalDate.now());
                ur.setVigente(true);
                usuarioRolRepository.save(ur);
            }
        }

        Usuario actualizado = usuarioRepository.save(usuario);
        return construirResponse(actualizado);
    }

    public List<UsuarioResponseDTO> listar() {
        return usuarioRepository.findAll().stream().map(this::construirResponse).toList();
    }

    public void desactivar(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setEstado("INACTIVO");
        usuarioRepository.save(usuario);
    }

    private UsuarioResponseDTO construirResponse(Usuario u) {
        List<UsuarioResponseDTO.RolInfo> roles = usuarioRolRepository
                .findAllByUsuario_IdUsuarioAndVigenteTrue(u.getIdUsuario())
                .stream()
                .filter(ur -> ur.getRol() != null)
                .map(ur -> new UsuarioResponseDTO.RolInfo(
                        ur.getRol().getIdRol(),
                        ur.getRol().getNombreRol()
                ))
                .toList();

        return new UsuarioResponseDTO(
                u.getIdUsuario(),
                u.getIdentidad(),
                u.getNombres(),
                u.getApellidos(),
                u.getEmail(),
                u.getTelefono(),
                u.getUsuario(),
                u.getEstado(),
                u.getFechaRegistro(),
                roles
        );
    }

    private String generarUsuario(String nombres, String apellidos) {
        String n = nombres.trim().split(" ")[0].toLowerCase();
        String a = apellidos.trim().split(" ")[0].toLowerCase();
        return n + "." + a;
    }
}

