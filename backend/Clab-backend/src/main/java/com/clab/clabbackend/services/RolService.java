package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.RolRequestDTO;
import com.clab.clabbackend.dto.RolResponseDTO;
import com.clab.clabbackend.entities.*;
import com.clab.clabbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import com.clab.clabbackend.repository.RolRolBDRepository;
import java.util.List;


@Service
public class RolService {

    @Autowired
    private RolRepository rolRepository;
    @Autowired
    private PermisoRepository permisoRepository;
    @Autowired
    private RolPermisoRepository rolPermisoRepository;
    @Autowired
    private jakarta.persistence.EntityManager entityManager;
    @Autowired
    private RolBDRepository rolBDRepository;
    @Autowired
    private UsuarioRolRepository UsuarioRolRepository;
    @Autowired
    private RolRolBDRepository rolRolBDRepository;
    @Transactional

    public Rol crear(RolRequestDTO dto) {

        if (dto.getNombreRol() == null || dto.getNombreRol().trim().isEmpty()) {
            throw new RuntimeException("El nombre del rol es obligatorio");
        }

        String nombre = dto.getNombreRol().trim();
        String descripcion = dto.getDescripcion();

        // 1️⃣ Crear mediante SP (esto ya inserta en u_rol)
        entityManager.createNativeQuery(
                        "CALL usuarios.sp_crear_rol_clab(:nombre, :descripcion)")
                .setParameter("nombre", nombre)
                .setParameter("descripcion", descripcion)
                .executeUpdate();

        Rol rolGuardado = rolRepository
                .findByNombreRolIgnoreCase(nombre)
                .orElseThrow(() ->
                        new RuntimeException("Rol no encontrado después de ejecutar SP"));


        guardarPermisos(rolGuardado, dto.getPermisos());

        if (dto.getRolesBD() != null) {
            for (String nombreRolBD : dto.getRolesBD()) {

                RolBD rolBdEntidad = rolBDRepository
                        .findByNombreRolBd(nombreRolBD)
                        .orElseThrow(() ->
                                new RuntimeException("Rol BD no encontrado: " + nombreRolBD));

                RolRolBD relacion = new RolRolBD();
                relacion.setRol(rolGuardado);
                relacion.setRolBd(rolBdEntidad);
                relacion.setFechaAsignacion(LocalDate.now());
                relacion.setVigente(true);

                rolRolBDRepository.save(relacion);
            }
        }

        return rolGuardado;
    }

    public List<RolResponseDTO> listar() {
        return rolRepository.findByNombreRolNotLike("clab_%").stream().map(rol -> {
                    List<String> rolesBD = rolRolBDRepository
                            .findByRol_IdRolAndVigenteTrue(rol.getIdRol())
                            .stream()
                            .map(rel -> rel.getRolBd().getNombreRolBd())
                            .toList();
                    return new RolResponseDTO(
                            rol.getIdRol(),
                            rol.getNombreRol(),
                            rol.getDescripcion(),
                            rol.getFechaCreacion(),
                            rolesBD
                    );
        }).toList();
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

        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        // 1️⃣ Eliminar relación usuario-rol
        UsuarioRolRepository.deleteByRol_IdRol(id);

        // 2️⃣ Eliminar relación rol-rolBD
        rolRolBDRepository.deleteByRol_IdRol(id);

        // 3️⃣ Eliminar relación rol-permiso
        rolPermisoRepository.deleteByRol_IdRol(id);

        // 4️⃣ Eliminar rol de la tabla u_rol
        rolRepository.delete(rol);

        // 5️⃣ Eliminar rol físico en PostgreSQL
        entityManager.createNativeQuery(
                "DROP ROLE IF EXISTS \"" + rol.getNombreRol().toLowerCase() + "\""
        ).executeUpdate();
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

    public List<String> listarRolesBD() {
        return entityManager.createNativeQuery("""
        SELECT rolname 
            FROM pg_roles 
            WHERE rolname LIKE 'clab_%'
        """)
                .getResultList();
    }
    @Transactional(readOnly = true)
    public List<Integer> obtenerPermisosActivos(Integer idRol) {
        return rolPermisoRepository.findByRol_IdRolAndVigenteTrue(idRol).stream().map(rp -> rp.getPermiso().getIdPermiso()).toList();
    }



}
