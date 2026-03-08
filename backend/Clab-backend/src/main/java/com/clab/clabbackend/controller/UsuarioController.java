package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.UsuarioRequestDTO;
import com.clab.clabbackend.dto.UsuarioResponseDTO;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.AuditoriaService;
import com.clab.clabbackend.services.UsuarioService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AuditoriaService auditoriaService;
    private final JwtService jwtService;

    public UsuarioController(UsuarioService usuarioService,
                             AuditoriaService auditoriaService,
                             JwtService jwtService) {
        this.usuarioService = usuarioService;
        this.auditoriaService = auditoriaService;
        this.jwtService = jwtService;
    }

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
                Object usuarioObj = claims.get("usuario"); // ← claim "usuario", no getSubject()
                if (usuarioObj != null) return usuarioObj.toString();
            }
        } catch (Exception ignored) {}
        return "desconocido";
    }

    @GetMapping("/listar")
    public List<UsuarioResponseDTO> listar() {
        return usuarioService.listar();
    }

    @PostMapping("/crear")
    public UsuarioResponseDTO crear(@RequestBody UsuarioRequestDTO dto, HttpServletRequest request) {
        return usuarioService.crear(dto,
                obtenerIdUsuario(request),
                obtenerUsuario(request),
                auditoriaService.obtenerIp(request));
    }

    @PutMapping("/actualizar/{id}")
    public UsuarioResponseDTO actualizar(@PathVariable Integer id,
                                         @RequestBody UsuarioRequestDTO dto,
                                         HttpServletRequest request) {
        return usuarioService.actualizar(id, dto,
                obtenerIdUsuario(request),
                obtenerUsuario(request),
                auditoriaService.obtenerIp(request));
    }

    @PutMapping("/desactivar/{id}")
    public void desactivar(@PathVariable Integer id, HttpServletRequest request) {
        usuarioService.desactivar(id,
                obtenerIdUsuario(request),
                obtenerUsuario(request),
                auditoriaService.obtenerIp(request));
    }
}