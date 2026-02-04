package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.UsuarioDTO;
import com.clab.clabbackend.entities.Usuario;
import com.clab.clabbackend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario crear(UsuarioDTO dto) {

        Usuario u = new Usuario();

        u.setIdentidad(dto.getIdentidad());
        u.setNombres(dto.getNombres());
        u.setApellidos(dto.getApellidos());
        u.setEmail(dto.getEmail());
        u.setTelefono(dto.getTelefono());

        // 🔥 USUARIO GENERADO AUTOMÁTICAMENTE
        String usuario = generarUsuario(dto.getNombres(), dto.getApellidos());
        u.setUsuario(usuario);

        u.setContrasenia(dto.getContrasenia());
        u.setEstado("Activo");
        u.setFechaRegistro(LocalDate.now());

        // foto pendiente
        u.setFoto(null);

        return usuarioRepository.save(u);
    }
    private String generarUsuario(String nombres, String apellidos) {
        String n = nombres.trim().split(" ")[0].toLowerCase();
        String a = apellidos.trim().split(" ")[0].toLowerCase();
        return n + "." + a;
    }


    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    public void eliminar(Integer id) {
        usuarioRepository.deleteById(id);
    }
}

