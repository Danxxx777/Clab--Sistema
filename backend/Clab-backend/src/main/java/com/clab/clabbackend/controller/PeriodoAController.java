package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.PerioDTO;
import com.clab.clabbackend.entities.PeriodoAcademico;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.AuditoriaService;
import com.clab.clabbackend.services.PeriodoAcademicoService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/periodos")
public class PeriodoAController {

    @Autowired private PeriodoAcademicoService periodoAcademicoService;
    @Autowired private JwtService jwtService;
    @Autowired private AuditoriaService auditoriaService;

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
                Object u = claims.get("usuario");
                if (u != null) return u.toString();
                Object s = claims.get("sub");
                if (s != null) return s.toString();
            }
        } catch (Exception ignored) {}
        return "desconocido";
    }

    @GetMapping("/listar")
    public List<PeriodoAcademico> listarPeriodos() {
        return periodoAcademicoService.listar();
    }

    @PostMapping("/crear")
    public PeriodoAcademico crearPeriodos(@RequestBody PerioDTO dto, HttpServletRequest request) {
        return periodoAcademicoService.crear(dto, obtenerIdUsuario(request), obtenerUsuario(request));
    }

    @PutMapping("/actualizar/{id}")
    public PeriodoAcademico actualizar(@PathVariable Integer id,
                                       @RequestBody PerioDTO dto,
                                       HttpServletRequest request) {
        return periodoAcademicoService.editar(id, dto, obtenerIdUsuario(request), obtenerUsuario(request));
    }

    @DeleteMapping("/eliminar/{id}")
    public void eliminarPeriodoAcademico(@PathVariable Integer id, HttpServletRequest request) {
        periodoAcademicoService.eliminar(id, obtenerIdUsuario(request), obtenerUsuario(request));
    }
}

