package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.RolBDDTO;
import com.clab.clabbackend.dto.RolRequestDTO;
import com.clab.clabbackend.dto.RolResponseDTO;
import com.clab.clabbackend.entities.Rol;
import com.clab.clabbackend.security.JwtService;
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
    private JwtService jwtService;

    @Autowired
    private com.clab.clabbackend.services.AuditoriaService auditoriaService;

    // ─── HELPERS JWT ─────────────────────────────────────────────────────────

    private Integer obtenerIdUsuario(HttpServletRequest request) {
        try {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                Claims claims = jwtService.obtenerClaims(header.substring(7));
                Object idObj = claims.get("idUsuario");
                if (idObj != null) return Integer.parseInt(idObj.toString());
                // fallback: subject suele ser el id en algunos setups
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
                // Buscar el claim con el username
                Object usuarioObj = claims.get("usuario");
                if (usuarioObj != null) return usuarioObj.toString();
                Object subObj = claims.get("sub");
                if (subObj != null) return subObj.toString();
            }
        } catch (Exception ignored) {}
        return "desconocido";
    }

    // ─── ENDPOINTS ───────────────────────────────────────────────────────────

    @GetMapping("/listar")
    public List<RolResponseDTO> listar() {
        return rolService.listar();
    }

    @PostMapping("/crear")
    public Rol crear(@RequestBody RolRequestDTO dto, HttpServletRequest request) {
        return rolService.crear(dto, obtenerIdUsuario(request), obtenerUsuario(request),
                auditoriaService.obtenerIp(request));
    }

    @PutMapping("/actualizar/{id}")
    public Rol actualizar(@PathVariable Integer id, @RequestBody RolRequestDTO dto,
                          HttpServletRequest request) {
        return rolService.actualizar(id, dto, obtenerIdUsuario(request), obtenerUsuario(request),
                auditoriaService.obtenerIp(request));
    }
    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id, HttpServletRequest request) {
        rolService.eliminar(id, obtenerIdUsuario(request), obtenerUsuario(request),
                auditoriaService.obtenerIp(request));
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
            rolService.cambiarEstado(id, estado, obtenerIdUsuario(request), obtenerUsuario(request),
                    auditoriaService.obtenerIp(request));
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


    @GetMapping("/publicos")
    public ResponseEntity<List<RolResponseDTO>> listarPublicos() {
        return ResponseEntity.ok(rolService.listarActivos());
    }
}