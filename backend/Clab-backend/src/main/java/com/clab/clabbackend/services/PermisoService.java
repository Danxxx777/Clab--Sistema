package com.clab.clabbackend.services;

import com.clab.clabbackend.entities.UsuarioRol;
import com.clab.clabbackend.repository.RolPermisoRepository;
import com.clab.clabbackend.repository.UsuarioRolRepository;
import org.springframework.stereotype.Service;

@Service
public class PermisoService {

    private final UsuarioRolRepository usuarioRolRepository;
    private final RolPermisoRepository rolPermisoRepository;

    public PermisoService(UsuarioRolRepository usuarioRolRepository,
                          RolPermisoRepository rolPermisoRepository) {
        this.usuarioRolRepository = usuarioRolRepository;
        this.rolPermisoRepository = rolPermisoRepository;
    }

    public void validarPermiso(Integer idUsuario, String modulo, String permiso) {

        UsuarioRol usuarioRol = usuarioRolRepository
                .findByUsuario_IdUsuarioAndVigenteTrue(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario sin rol"));

        boolean autorizado = rolPermisoRepository
                .existsByRol_IdRolAndModulo_NombreModuloAndPermiso_NombrePermisoAndVigenteTrue(
                        usuarioRol.getRol().getIdRol(),
                        modulo,
                        permiso
                );

        if (!autorizado) {
            throw new RuntimeException("Acceso denegado");
        }
    }
}
