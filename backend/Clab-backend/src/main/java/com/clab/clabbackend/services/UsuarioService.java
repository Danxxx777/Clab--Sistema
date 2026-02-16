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
        usuarioRepository.spUsuarioInsertar(
                dto.getIdentidad(),
                dto.getNombres(),
                dto.getApellidos(),
                dto.getEmail(),
                dto.getTelefono(),
                usuarioBd,
                passwordSistema,
                passwordBd,
                dto.getIdRol()
        );

        Usuario usuarioCreado = usuarioRepository
                .findByUsuario(usuarioBd)
                .orElseThrow(() -> new RuntimeException("Error creando usuario"));
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
        if (dto.getIdRol() != null) {
            var rolActualOpt = usuarioRolRepository.findByUsuario_IdUsuarioAndVigenteTrue(usuario.getIdUsuario());
            if (rolActualOpt.isPresent()) {
                var rolActual = rolActualOpt.get();
                if (!rolActual.getRol().getIdRol().equals(dto.getIdRol())) {
                    rolActual.setVigente(false);
                    usuarioRolRepository.save(rolActual);
                    var nuevoRol = new UsuarioRol();
                    nuevoRol.setUsuario(usuario);
                    nuevoRol.setRol(rolRepository.findById(dto.getIdRol()).orElseThrow(() -> new RuntimeException("Rol no encontrado")));
                    nuevoRol.setFechaAsignacion(LocalDate.now());
                    nuevoRol.setVigente(true);
                    usuarioRolRepository.save(nuevoRol);
                }
            }
        }
        Usuario actualizado = usuarioRepository.save(usuario);
        return construirResponse(actualizado);
    }

    public List<UsuarioResponseDTO> listar() {
        return usuarioRepository.findAll().stream().map(this::construirResponse).toList();
    }

    public void desactivar(Integer id) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setEstado("INACTIVO");
        usuarioRepository.save(usuario);
    }

    private UsuarioResponseDTO construirResponse(Usuario u) {

        Integer idRol = null;
        String nombreRol = "Sin rol";

        var rolOpt = usuarioRolRepository
                .findByUsuario_IdUsuarioAndVigenteTrue(u.getIdUsuario());

        if (rolOpt.isPresent()) {
            UsuarioRol ur = rolOpt.get();

            if (ur.getRol() != null) {

                // 🔹 Obtiene el ID del rol sin importar si se llama id o idRol
                try {
                    idRol = (Integer) ur.getRol()
                            .getClass()
                            .getMethod("getIdRol")
                            .invoke(ur.getRol());
                } catch (Exception e) {
                    try {
                        idRol = (Integer) ur.getRol()
                                .getClass()
                                .getMethod("getId")
                                .invoke(ur.getRol());
                    } catch (Exception ignored) {}
                }

                // 🔹 Obtiene el nombre del rol sin importar si se llama nombre o nombreRol
                try {
                    nombreRol = (String) ur.getRol()
                            .getClass()
                            .getMethod("getNombre")
                            .invoke(ur.getRol());
                } catch (Exception e) {
                    try {
                        nombreRol = (String) ur.getRol()
                                .getClass()
                                .getMethod("getNombreRol")
                                .invoke(ur.getRol());
                    } catch (Exception ignored) {}
                }
            }
        }

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
                idRol,
                nombreRol
        );
    }


    private String generarUsuario(String nombres, String apellidos) {
        String n = nombres.trim().split(" ")[0].toLowerCase();
        String a = apellidos.trim().split(" ")[0].toLowerCase();
        return n + "." + a;
    }
}
