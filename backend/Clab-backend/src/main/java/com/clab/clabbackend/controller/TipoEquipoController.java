package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.TipoEquipoDTO;
import com.clab.clabbackend.entities.TipoEquipo;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.AuditoriaService;
import com.clab.clabbackend.services.TipoEquipoService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tipos-equipo")
public class TipoEquipoController {

    @Autowired
    private TipoEquipoService tipoEquipoService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuditoriaService auditoriaService;

    // ─── HELPERS JWT ─────────────────────────────────────────────────────────

    private Integer obtenerIdUsuario(HttpServletRequest request) {
        try {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                Claims claims = jwtService.obtenerClaims(header.substring(7));
                Object idObj = claims.get("idUsuario");
                if (idObj != null) return Integer.parseInt(idObj.toString());
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
    public List<TipoEquipo> listar() {
        return tipoEquipoService.listar();
    }

    @PostMapping("/crear")
    public void crear(@RequestBody TipoEquipoDTO dto, HttpServletRequest request) {
        tipoEquipoService.crear(dto, obtenerIdUsuario(request), obtenerUsuario(request));
    }

    @PutMapping("/actualizar/{id}")
    public void actualizar(@PathVariable Integer id,
                           @RequestBody TipoEquipoDTO dto,
                           HttpServletRequest request) {
        tipoEquipoService.actualizar(id, dto, obtenerIdUsuario(request), obtenerUsuario(request));
    }

    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id, HttpServletRequest request) {
        tipoEquipoService.eliminar(id, obtenerIdUsuario(request), obtenerUsuario(request));
    }
}