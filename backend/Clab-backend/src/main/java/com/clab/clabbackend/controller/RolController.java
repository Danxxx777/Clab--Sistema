package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.RolBDDTO;
import com.clab.clabbackend.dto.RolRequestDTO;
import com.clab.clabbackend.dto.RolResponseDTO;
import com.clab.clabbackend.entities.Rol;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.AuditoriaService;
import com.clab.clabbackend.services.RolService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/roles")
public class RolController {

    @Autowired
    private RolService rolService;

    @Autowired
    private AuditoriaService auditoriaService;

    @Autowired
    private JwtService jwtService;

    private Integer obtenerIdUsuario(HttpServletRequest request) {
        try {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                Claims claims = jwtService.obtenerClaims(header.substring(7));
                return Integer.parseInt(claims.getSubject());
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String obtenerUsuario(HttpServletRequest request) {
        try {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                Claims claims = jwtService.obtenerClaims(header.substring(7));
                return claims.getSubject();
            }
        } catch (Exception ignored) {}
        return "desconocido";
    }

    @GetMapping("/listar")
    public List<RolResponseDTO> listar() {
        return rolService.listar();
    }

    @PostMapping("/crear")
    public Rol crear(@RequestBody RolRequestDTO dto, HttpServletRequest request) {
        Rol resultado = rolService.crear(dto);
        auditoriaService.registrarExito(
                obtenerIdUsuario(request), obtenerUsuario(request),
                "CREAR_ROL", "ROLES", "u_rol",
                resultado.getIdRol(), "Creó el rol: " + dto.getNombreRol(),
                auditoriaService.obtenerIp(request)
        );
        return resultado;
    }

    @PutMapping("/actualizar/{id}")
    public Rol actualizar(@PathVariable Integer id, @RequestBody RolRequestDTO dto,
                          HttpServletRequest request) {
        Rol resultado = rolService.actualizar(id, dto);
        auditoriaService.registrarExito(
                obtenerIdUsuario(request), obtenerUsuario(request),
                "EDITAR_ROL", "ROLES", "u_rol",
                id, "Actualizó el rol: " + dto.getNombreRol(),
                auditoriaService.obtenerIp(request)
        );
        return resultado;
    }

    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id, HttpServletRequest request) {
        auditoriaService.registrarExito(
                obtenerIdUsuario(request), obtenerUsuario(request),
                "ELIMINAR_ROL", "ROLES", "u_rol",
                id, "Eliminó el rol con id: " + id,
                auditoriaService.obtenerIp(request)
        );
        rolService.eliminar(id);
    }

    @GetMapping("/{id}/permisos")
    public List<Integer> obtenerPermisos(@PathVariable Integer id) {
        return rolService.obtenerPermisosActivos(id);
    }

    @GetMapping("/roles-bd")
    public List<RolBDDTO> listarRolesBD() {
        return rolService.listarRolesBD();
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Integer id,
                                           @RequestBody Map<String, String> body,
                                           HttpServletRequest request) {
        try {
            String estado = body.get("estado");
            rolService.cambiarEstado(id, estado);
            auditoriaService.registrarExito(
                    obtenerIdUsuario(request), obtenerUsuario(request),
                    "CAMBIAR_ESTADO_ROL", "ROLES", "u_rol",
                    id, "Cambió estado del rol " + id + " a: " + estado,
                    auditoriaService.obtenerIp(request)
            );
            return ResponseEntity.ok(Map.of("mensaje", "Estado actualizado a " + estado));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/roles-bd/{idRolBd}/permisos-esquemas")
    public ResponseEntity<List<Map<String, Object>>> obtenerPermisosEsquemas(@PathVariable Integer idRolBd) {
        return ResponseEntity.ok(rolService.obtenerPermisosEsquemas(idRolBd));
    }
    @GetMapping("/esquemas")
    public ResponseEntity<List<String>> listarEsquemas() {
        return ResponseEntity.ok(rolService.listarEsquemas());
    }
}