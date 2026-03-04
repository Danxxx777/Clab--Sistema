package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.UsuarioRequestDTO;
import com.clab.clabbackend.dto.UsuarioResponseDTO;
import com.clab.clabbackend.services.AuditoriaService;
import com.clab.clabbackend.services.PermisoService;
import com.clab.clabbackend.services.UsuarioService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import com.clab.clabbackend.security.JwtService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final PermisoService permisoService;
    private final AuditoriaService auditoriaService;
    private final JwtService jwtService;

    public UsuarioController(UsuarioService usuarioService, PermisoService permisoService,
                             AuditoriaService auditoriaService, JwtService jwtService) {
        this.usuarioService = usuarioService;
        this.permisoService = permisoService;
        this.auditoriaService = auditoriaService;
        this.jwtService = jwtService;
    }

    private Integer obtenerIdUsuarioDesdeToken(HttpServletRequest request) {
        try {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                Claims claims = jwtService.obtenerClaims(header.substring(7));
                return Integer.parseInt(claims.getSubject());
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String obtenerUsuarioDesdeToken(HttpServletRequest request) {
        try {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                Claims claims = jwtService.obtenerClaims(header.substring(7));
                return claims.getSubject(); // retorna el idUsuario como string
            }
        } catch (Exception ignored) {}
        return "desconocido";
    }

    @PostMapping("/crear")
    @PreAuthorize("hasAuthority('PERMISO_CREAR')")
    public UsuarioResponseDTO crear(@RequestBody UsuarioRequestDTO dto, HttpServletRequest request) {
        UsuarioResponseDTO resultado = usuarioService.crear(dto);
        return resultado;
    }

    @GetMapping("/listar")
    @PreAuthorize("hasAuthority('PERMISO_LEER')")
    public List<UsuarioResponseDTO> listar() {
        return usuarioService.listar();
    }

    @PutMapping("/desactivar/{id}")
    @PreAuthorize("hasAuthority('PERMISO_EDITAR')")
    public void desactivar(@PathVariable Integer id, HttpServletRequest request) {
        usuarioService.desactivar(id);
        auditoriaService.registrarExito(
                obtenerIdUsuarioDesdeToken(request), obtenerUsuarioDesdeToken(request),
                "DESACTIVAR_USUARIO", "USUARIOS", "u_usuario",
                id, "Desactivó el usuario con id: " + id,
                auditoriaService.obtenerIp(request)
        );
    }

    @PutMapping("/actualizar/{id}")
    @PreAuthorize("hasAuthority('PERMISO_EDITAR')")
    public UsuarioResponseDTO actualizar(@PathVariable Integer id,
                                         @RequestBody UsuarioRequestDTO dto,
                                         HttpServletRequest request) {
        UsuarioResponseDTO resultado = usuarioService.actualizar(id, dto);
        auditoriaService.registrarExito(
                obtenerIdUsuarioDesdeToken(request), obtenerUsuarioDesdeToken(request),
                "EDITAR_USUARIO", "USUARIOS", "u_usuario",
                id, "Actualizó el usuario con id: " + id,
                auditoriaService.obtenerIp(request)
        );
        return resultado;
    }
}