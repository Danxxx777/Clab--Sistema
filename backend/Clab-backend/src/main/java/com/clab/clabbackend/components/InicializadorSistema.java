package com.clab.clabbackend.components;

import com.clab.clabbackend.entities.Rol;
import com.clab.clabbackend.entities.Usuario;
import com.clab.clabbackend.entities.UsuarioRol;
import com.clab.clabbackend.repository.RolRepository;
import com.clab.clabbackend.repository.UsuarioRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class InicializadorSistema implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository     rolRepository;
    private final PasswordEncoder   passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        try {
            long totalUsuarios = usuarioRepository.count();
            if (totalUsuarios == 0) {
                log.info("=== BD vacía detectada — creando usuario administrador temporal ===");
                crearUsuarioAdminTemporal();
                log.info("=== Usuario temporal creado: admin_clab / Admin2026* ===");
            }
        } catch (Exception e) {
            log.warn("No se pudo verificar/crear usuario temporal: {}", e.getMessage());
        }
    }
    private void crearUsuarioAdminTemporal() {
        Rol rol = rolRepository.findByNombreRol("Administradorr")
                .orElseGet(() -> {
                    log.info("Rol 'Administradorr' no encontrado, creándolo...");
                    Rol nuevoRol = new Rol();
                    nuevoRol.setNombreRol("Administradorr");
                    nuevoRol.setDescripcion("Administrador del sistema");
                    nuevoRol.setFechaCreacion(LocalDate.now());
                    nuevoRol.setEstado("ACTIVO");
                    return rolRepository.save(nuevoRol);
                });

        Usuario admin = new Usuario();
        admin.setIdentidad("0000000000");
        admin.setNombres("Administrador");
        admin.setApellidos("CLAB");
        admin.setEmail("admin@clab.com");
        admin.setUsuario("admin_clab");
        admin.setContrasenia(passwordEncoder.encode("Admin2026*"));
        admin.setEstado("ACTIVO");
        admin.setFechaRegistro(LocalDate.now());
        admin.setPrimerLogin(false);

        Usuario adminGuardado = usuarioRepository.save(admin);

        UsuarioRol usuarioRol = new UsuarioRol();
        usuarioRol.setUsuario(adminGuardado);
        usuarioRol.setRol(rol);
        usuarioRol.setFechaAsignacion(LocalDate.now());
        usuarioRol.setVigente(true);

        entityManager.persist(usuarioRol);

        log.info("Usuario temporal creado — usuario: admin_clab, contraseña: Admin2026*");
    }
}