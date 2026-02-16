package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.RolRequestDTO;
import com.clab.clabbackend.entities.Permiso;
import com.clab.clabbackend.entities.Rol;
import com.clab.clabbackend.entities.RolPermiso;
import com.clab.clabbackend.repository.PermisoRepository;
import com.clab.clabbackend.repository.RolPermisoRepository;
import com.clab.clabbackend.repository.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class RolService {

    @Autowired
    private RolRepository rolRepository;
    @Autowired
    private PermisoRepository permisoRepository;
    @Autowired
    private RolPermisoRepository rolPermisoRepository;

    @Transactional
    public Rol crear(RolRequestDTO dto) {

        if (dto.getNombreRol() == null || dto.getNombreRol().trim().isEmpty()) {
            throw new RuntimeException("El nombre del rol es obligatorio");
        }
        Rol rol = new Rol();
        rol.setNombreRol(dto.getNombreRol().trim());
        rol.setDescripcion(dto.getDescripcion());
        rol.setFechaCreacion(LocalDate.now());
        Rol rolGuardado = rolRepository.save(rol);
        guardarPermisos(rolGuardado, dto.getPermisos());
        return rolGuardado;
    }

    public List<Rol> listar() {
        return rolRepository.findAll();
    }

    @Transactional
    public Rol actualizar(Integer id, RolRequestDTO dto) {

        Rol rol = rolRepository.findById(id).orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        rol.setNombreRol(dto.getNombreRol().trim());
        rol.setDescripcion(dto.getDescripcion());
        Rol rolActualizado = rolRepository.save(rol);
        rolPermisoRepository.deleteByRol_IdRol(id);
        guardarPermisos(rolActualizado, dto.getPermisos());
        return rolActualizado;
    }

    @Transactional
    public void eliminar(Integer id) {
        rolPermisoRepository.deleteByRol_IdRol(id);
        rolRepository.deleteById(id);
    }

    private void guardarPermisos(Rol rol, List<Integer> permisosIds) {

        for (Integer idPermiso : permisosIds) {
            Permiso permiso = permisoRepository.findById(idPermiso).orElseThrow(() -> new RuntimeException("Permiso no encontrado: " + idPermiso));
            RolPermiso rolPermiso = new RolPermiso();
            rolPermiso.setRol(rol);
            rolPermiso.setPermiso(permiso);
            rolPermiso.setVigente(true);
            rolPermisoRepository.save(rolPermiso);
        }
    }
    @Transactional(readOnly = true)
    public List<Integer> obtenerPermisosActivos(Integer idRol) {
        return rolPermisoRepository.findByRol_IdRolAndVigenteTrue(idRol).stream().map(rp -> rp.getPermiso().getIdPermiso()).toList();
    }
}
