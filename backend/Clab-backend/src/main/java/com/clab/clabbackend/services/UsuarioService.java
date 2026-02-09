package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.UsuarioDTO;
import com.clab.clabbackend.dto.UsuarioResponseDTO;
import com.clab.clabbackend.entities.Rol;
import com.clab.clabbackend.entities.Usuario;
import com.clab.clabbackend.entities.UsuarioRol;
import com.clab.clabbackend.repository.RolRepository;
import com.clab.clabbackend.repository.UsuarioRepository;
import com.clab.clabbackend.repository.UsuarioRolRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final UsuarioRolRepository usuarioRolRepository;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            UsuarioRolRepository usuarioRolRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.usuarioRolRepository = usuarioRolRepository;
    }

    /*CREAR USUARIO*/
    public Usuario crear(UsuarioDTO dto) {

        Usuario usuario = new Usuario();
        usuario.setIdentidad(dto.getIdentidad());
        usuario.setNombres(dto.getNombres());
        usuario.setApellidos(dto.getApellidos());
        usuario.setEmail(dto.getEmail());
        usuario.setTelefono(dto.getTelefono());
        usuario.setUsuario(generarUsuario(dto.getNombres(), dto.getApellidos()));
        usuario.setContrasenia(dto.getContrasenia());
        usuario.setEstado("Activo");
        usuario.setFechaRegistro(LocalDate.now());
        usuario.setFoto(null);

        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        asignarRol(usuarioGuardado, dto.getIdRol());

        return usuarioGuardado;
    }

    /* ACTUALIZAR USUARIO*/
    public Usuario actualizar(Integer id, UsuarioDTO dto) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setIdentidad(dto.getIdentidad());
        usuario.setNombres(dto.getNombres());
        usuario.setApellidos(dto.getApellidos());
        usuario.setEmail(dto.getEmail());
        usuario.setTelefono(dto.getTelefono());

        if (dto.getContrasenia() != null && !dto.getContrasenia().isBlank()) {
            usuario.setContrasenia(dto.getContrasenia());
        }

        Usuario actualizado = usuarioRepository.save(usuario);

        cambiarRol(actualizado, dto.getIdRol());

        return actualizado;
    }

    /* LISTAR*/
    public List<UsuarioResponseDTO> listar() {

        return usuarioRepository.findAll().stream().map(u -> {

            UsuarioRol ur = usuarioRolRepository
                    .findByUsuario_IdUsuarioAndVigenteTrue(u.getIdUsuario())
                    .orElse(null);

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
                    ur != null ? ur.getRol().getIdRol() : null,
                    ur != null ? ur.getRol().getNombreRol() : "Sin rol"
            );
        }).toList();
    }


    /* DESACTIVAR (SOFT DELETE) */
    public void desactivar(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setEstado("INACTIVO");
        usuarioRepository.save(usuario);
    }

    /*MÉTODOS PRIVADOS*/
    private void asignarRol(Usuario usuario, Integer idRol) {

        Rol rol = rolRepository.findById(idRol)
                .orElseThrow(() -> new RuntimeException("Rol no válido"));

        UsuarioRol ur = new UsuarioRol();
        ur.setUsuario(usuario);
        ur.setRol(rol);
        ur.setFechaAsignacion(LocalDate.now());
        ur.setVigente(true);

        usuarioRolRepository.save(ur);
    }

    private void cambiarRol(Usuario usuario, Integer idRol) {

        usuarioRolRepository
                .findByUsuario_IdUsuarioAndVigenteTrue(usuario.getIdUsuario())
                .ifPresent(urActual -> {
                    urActual.setVigente(false);
                    usuarioRolRepository.save(urActual);
                });

        asignarRol(usuario, idRol);
    }

    private String generarUsuario(String nombres, String apellidos) {
        String n = nombres.trim().split(" ")[0].toLowerCase();
        String a = apellidos.trim().split(" ")[0].toLowerCase();
        return n + "." + a;
    }
}
