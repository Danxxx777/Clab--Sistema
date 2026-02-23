package com.clab.clabbackend.services;

import com.clab.clabbackend.entities.RolRolBD;
import com.clab.clabbackend.entities.UsuarioRol;
import com.clab.clabbackend.repository.RolRolBDRepository;
import com.clab.clabbackend.repository.UsuarioRolRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeguridadRolService {

    private final UsuarioRolRepository usuarioRolRepository;
    private final RolRolBDRepository rolRolBDRepository;

    public SeguridadRolService(UsuarioRolRepository usuarioRolRepository,
                               RolRolBDRepository rolRolBDRepository) {
        this.usuarioRolRepository = usuarioRolRepository;
        this.rolRolBDRepository = rolRolBDRepository;
    }

    public String obtenerRolBdPorUsuario(Integer idUsuario) {

        UsuarioRol usuarioRol = usuarioRolRepository
                .findByUsuario_IdUsuarioAndVigenteTrue(idUsuario)
                .orElseThrow(() -> new RuntimeException("El usuario no tiene rol asignado"));

        List<RolRolBD> relaciones = rolRolBDRepository
                .findByRol_IdRolAndVigenteTrue(usuarioRol.getRol().getIdRol());

        if (relaciones.isEmpty()) {
            throw new RuntimeException("El rol no tiene rol BD asociado");
        }

        RolRolBD rolRolBD = relaciones.get(0);
        return rolRolBD.getRolBd().getNombreRolBd();
    }
}//a
