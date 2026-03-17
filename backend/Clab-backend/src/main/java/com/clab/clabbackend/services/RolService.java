package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.RolBDDTO;
import com.clab.clabbackend.dto.RolBdEsquemaPermisoDTO;
import com.clab.clabbackend.dto.RolRequestDTO;
import com.clab.clabbackend.dto.RolResponseDTO;
import com.clab.clabbackend.entities.*;
import com.clab.clabbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import jakarta.persistence.EntityManager;
import com.clab.clabbackend.repository.RolRolBDRepository;
import java.util.List;
import java.util.Map;

@Service
public class RolService {

    @Autowired
    private RolRepository rolRepository;
    @Autowired
    private PermisoRepository permisoRepository;
    @Autowired
    private RolPermisoRepository rolPermisoRepository;
    @Autowired
    private EntityManager entityManager;
    @Autowired
    private RolBDRepository rolBDRepository;
    @Autowired
    private UsuarioRolRepository UsuarioRolRepository;
    @Autowired
    private RolRolBDRepository rolRolBDRepository;
    @Autowired
    private RolBdEsquemaPermisoRepository rolBdEsquemaPermisoRepository;

    // ─── CONTEXT ─────────────────────────────────────────────────────────────

    private void setActorContext(Integer actorId, String actorUsuario) {
        entityManager.createNativeQuery(
                        "SELECT set_config('clab.actor_id', :id, true), " +
                                "set_config('clab.actor_usuario', :usuario, true)"
                )
                .setParameter("id",      actorId != null ? actorId.toString() : "0")
                .setParameter("usuario", actorUsuario != null ? actorUsuario : "Sistema")
                .getSingleResult();
    }

    // ─── SYNC BD ─────────────────────────────────────────────────────────────

    private void sincronizarRolesBD() {
        List<String> rolesPostgres = entityManager.createNativeQuery(
                "SELECT rolname FROM pg_roles WHERE rolname LIKE 'clab_%'"
        ).getResultList();

        for (String nombre : rolesPostgres) {
            if (rolBDRepository.findByNombreRolBd(nombre).isEmpty()) {
                RolBD nuevo = new RolBD();
                nuevo.setNombreRolBd(nombre);
                nuevo.setFechaCreacion(LocalDate.now());
                rolBDRepository.save(nuevo);
            }
        }
    }

    // ─── CREAR ───────────────────────────────────────────────────────────────

    @Transactional
    public Rol crear(RolRequestDTO dto, Integer actorId, String actorUsuario, String ip) {
        setActorContext(actorId, actorUsuario);
        sincronizarRolesBD();

        if (dto.getNombreRol() == null || dto.getNombreRol().trim().isEmpty()) {
            throw new RuntimeException("El nombre del rol es obligatorio");
        }

        String nombre = dto.getNombreRol().trim();
        String descripcion = dto.getDescripcion();

        entityManager.createNativeQuery(
                        "CALL usuarios.sp_crear_rol_clab(:nombre, :descripcion)")
                .setParameter("nombre", nombre)
                .setParameter("descripcion", descripcion)
                .executeUpdate();

        Rol rolGuardado = rolRepository.findByNombreRolIgnoreCase(nombre)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado después de ejecutar SP"));

        rolGuardado.setEstado("ACTIVO");
        rolRepository.save(rolGuardado);

        guardarPermisos(rolGuardado, dto.getPermisos());

        if (dto.getRolesBD() != null) {
            for (String nombreRolBD : dto.getRolesBD()) {
                RolBD rolBdEntidad = rolBDRepository.findByNombreRolBd(nombreRolBD)
                        .orElseThrow(() -> new RuntimeException("Rol BD no encontrado: " + nombreRolBD));
                RolRolBD relacion = new RolRolBD();
                relacion.setRol(rolGuardado);
                relacion.setRolBd(rolBdEntidad);
                relacion.setFechaAsignacion(LocalDate.now());
                relacion.setVigente(true);
                rolRolBDRepository.save(relacion);
            }
        }

        asignarPermisosEsquemas(dto.getPermisosEsquemas());

        return rolGuardado;
    }

    // ─── LISTAR ──────────────────────────────────────────────────────────────

    public List<RolResponseDTO> listar() {
        return rolRepository.findByNombreRolNotLike("clab_%").stream().map(rol -> {
            List<RolBDDTO> rolesBD = rolRolBDRepository
                    .findByRol_IdRolAndVigenteTrue(rol.getIdRol())
                    .stream()
                    .map(rel -> new RolBDDTO(
                            rel.getRolBd().getIdRolBd(),
                            rel.getRolBd().getNombreRolBd(),
                            rel.getRolBd().getDescripcion()
                    ))
                    .toList();
            return new RolResponseDTO(
                    rol.getIdRol(),
                    rol.getNombreRol(),
                    rol.getDescripcion(),
                    rol.getFechaCreacion(),
                    rolesBD,
                    rol.getEstado() != null ? rol.getEstado() : "ACTIVO"
            );
        }).toList();
    }

    // ─── ACTUALIZAR ──────────────────────────────────────────────────────────

    @Transactional
    public Rol actualizar(Integer id, RolRequestDTO dto, Integer actorId, String actorUsuario, String ip) {
        setActorContext(actorId, actorUsuario);
        sincronizarRolesBD();

        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        rol.setNombreRol(dto.getNombreRol().trim());
        rol.setDescripcion(dto.getDescripcion());
        if (dto.getEstado() != null && !dto.getEstado().isBlank()) {
            rol.setEstado(dto.getEstado());
        }
        Rol rolActualizado = rolRepository.save(rol);

        rolPermisoRepository.deleteByRol_IdRol(id);
        guardarPermisos(rolActualizado, dto.getPermisos());

        rolRolBDRepository.deleteByRol_IdRol(id);
        if (dto.getRolesBD() != null) {
            for (String nombreRolBD : dto.getRolesBD()) {
                RolBD rolBdEntidad = rolBDRepository.findByNombreRolBd(nombreRolBD)
                        .orElseThrow(() -> new RuntimeException("Rol BD no encontrado: " + nombreRolBD));
                RolRolBD relacion = new RolRolBD();
                relacion.setRol(rolActualizado);
                relacion.setRolBd(rolBdEntidad);
                relacion.setFechaAsignacion(LocalDate.now());
                relacion.setVigente(true);
                rolRolBDRepository.save(relacion);
            }
        }

        asignarPermisosEsquemas(dto.getPermisosEsquemas());

        return rolActualizado;
    }

    // ─── CAMBIAR ESTADO ──────────────────────────────────────────────────────

    @Transactional
    public void cambiarEstado(Integer id, String estado, Integer actorId, String actorUsuario, String ip) {
        setActorContext(actorId, actorUsuario);

        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        if (!estado.equals("ACTIVO") && !estado.equals("INACTIVO")) {
            throw new RuntimeException("Estado inválido. Use ACTIVO o INACTIVO");
        }

        rol.setEstado(estado);
        rolRepository.save(rol);
    }

    // ─── ELIMINAR ────────────────────────────────────────────────────────────

    @Transactional
    public void eliminar(Integer id, Integer actorId, String actorUsuario, String ip) {
        setActorContext(actorId, actorUsuario);

        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        String nombreRol = rol.getNombreRol();

        UsuarioRolRepository.deleteByRol_IdRol(id);
        rolRolBDRepository.deleteByRol_IdRol(id);
        rolPermisoRepository.deleteByRol_IdRol(id);
        rolRepository.delete(rol);

        entityManager.createNativeQuery(
                "DROP ROLE IF EXISTS \"" + nombreRol.toLowerCase() + "\""
        ).executeUpdate();
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    private void guardarPermisos(Rol rol, List<Integer> permisosIds) {
        if (permisosIds == null) return;
        for (Integer idPermiso : permisosIds) {
            Permiso permiso = permisoRepository.findById(idPermiso)
                    .orElseThrow(() -> new RuntimeException("Permiso no encontrado: " + idPermiso));
            RolPermiso rolPermiso = new RolPermiso();
            rolPermiso.setRol(rol);
            rolPermiso.setPermiso(permiso);
            rolPermiso.setVigente(true);
            rolPermisoRepository.save(rolPermiso);
        }
    }

    @Transactional
    public List<RolBDDTO> listarRolesBD() {
        sincronizarRolesBD();
        return rolBDRepository.findAll().stream()
                .filter(r -> r.getNombreRolBd().startsWith("clab_"))
                .map(r -> new RolBDDTO(
                        r.getIdRolBd(),
                        r.getNombreRolBd(),
                        r.getDescripcion()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Integer> obtenerPermisosActivos(Integer idRol) {
        return rolPermisoRepository.findByRol_IdRolAndVigenteTrue(idRol)
                .stream()
                .map(rp -> rp.getPermiso().getIdPermiso())
                .toList();
    }

    private void asignarPermisosEsquemas(List<RolBdEsquemaPermisoDTO> permisos) {
        if (permisos == null || permisos.isEmpty()) return;

        permisos.stream()
                .map(RolBdEsquemaPermisoDTO::idRolBd)
                .distinct()
                .forEach(idRolBd ->
                        entityManager.createNativeQuery(
                                "UPDATE usuarios.u_rol_bd_esquema_permiso SET vigente = false WHERE id_rol_bd = " + idRolBd
                        ).executeUpdate()
                );

        for (RolBdEsquemaPermisoDTO p : permisos) {
            rolBDRepository.spAsignarPermisos(
                    p.idRolBd(), p.nombreRolBd(), p.nombreEsquema(),
                    p.select(), p.insert(), p.update(), p.delete()
            );
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerPermisosEsquemas(Integer idRolBd) {
        return rolBdEsquemaPermisoRepository
                .findByRolBd_IdRolBdAndVigenteTrue(idRolBd)
                .stream()
                .map(r -> {
                    Map<String, Object> m = new java.util.HashMap<>();
                    m.put("nombreEsquema", r.getNombreEsquema());
                    m.put("select",        r.isPermisoSelect());
                    m.put("insert",        r.isPermisoInsert());
                    m.put("update",        r.isPermisoUpdate());
                    m.put("delete",        r.isPermisoDelete());
                    return m;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> listarEsquemas() {
        return entityManager.createNativeQuery(
                "SELECT schema_name FROM information_schema.schemata " +
                        "WHERE schema_name NOT IN ('pg_catalog', 'information_schema') " +
                        "AND schema_name NOT LIKE 'pg_%' " +
                        "ORDER BY schema_name"
        ).getResultList();
    }

    @Transactional(readOnly = true)
    public List<RolResponseDTO> listarActivos() {
        return rolRepository.findByNombreRolNotLike("clab_%").stream()
                .filter(r -> "ACTIVO".equals(r.getEstado()))
                .filter(r -> !r.getNombreRol().equalsIgnoreCase("Administradorr")) // ← excluir admin
                .map(rol -> new RolResponseDTO(
                        rol.getIdRol(),
                        rol.getNombreRol(),
                        rol.getDescripcion(),
                        rol.getFechaCreacion(),
                        List.of(),
                        "ACTIVO"
                ))
                .toList();
    }
}