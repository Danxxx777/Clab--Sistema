package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.LaboratorioDTO;
import com.clab.clabbackend.entities.Laboratorio;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.AuditoriaService;
import com.clab.clabbackend.services.LaboratorioService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/laboratorios")
public class LaboratorioController {

    @Autowired
    private LaboratorioService laboratorioService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuditoriaService auditoriaService;

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
            }
        } catch (Exception ignored) {}
        return "desconocido";
    }
    // Lista todos los laboratorios
    @GetMapping("/listar")
    public List<Laboratorio> listarLaboratorios() {
        return laboratorioService.listar();
    }

    // Obtiene un laboratorio por su código
    @GetMapping("/obtener/{codLaboratorio}")
    public ResponseEntity<Laboratorio> obtenerPorId(@PathVariable Integer codLaboratorio) {
        return ResponseEntity.ok(laboratorioService.obtenerPorId(codLaboratorio));
    }


    // Crea un nuevo laboratorio
    @PostMapping("/crear")
    public Laboratorio crearLaboratorio(@RequestBody LaboratorioDTO dto, HttpServletRequest request) {
        return laboratorioService.crear(dto,
                obtenerIdUsuario(request), obtenerUsuario(request),
                auditoriaService.obtenerIp(request));
    }

    // Actualiza un laboratorio existente
    @PutMapping("/actualizar/{codLaboratorio}")
    public Laboratorio actualizarLaboratorio(@PathVariable Integer codLaboratorio,
                                             @RequestBody LaboratorioDTO dto,
                                             HttpServletRequest request) {
        return laboratorioService.actualizar(codLaboratorio, dto,
                obtenerIdUsuario(request), obtenerUsuario(request),
                auditoriaService.obtenerIp(request));
    }


    // Elimina un laboratorio por su código
    @DeleteMapping("/eliminar/{codLaboratorio}")
    public ResponseEntity<String> eliminarLaboratorio(@PathVariable Integer codLaboratorio,
                                                      HttpServletRequest request) {
        laboratorioService.eliminar(codLaboratorio,
                obtenerIdUsuario(request), obtenerUsuario(request),
                auditoriaService.obtenerIp(request));
        return ResponseEntity.ok("Laboratorio eliminado exitosamente");
    }
}