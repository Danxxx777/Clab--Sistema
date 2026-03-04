package com.clab.clabbackend.controller;

import com.clab.clabbackend.entities.Auditoria;
import com.clab.clabbackend.entities.SesionActiva;
import com.clab.clabbackend.services.AuditoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auditoria")
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    public AuditoriaController(AuditoriaService auditoriaService) {
        this.auditoriaService = auditoriaService;
    }

    // Ver todos los registros de auditoría
    @GetMapping("/listar")
    @PreAuthorize("hasAuthority('PERMISO_LEER')")
    public ResponseEntity<List<Auditoria>> listar() {
        return ResponseEntity.ok(auditoriaService.listarTodo());
    }

    // Ver auditoría por usuario
    @GetMapping("/usuario/{idUsuario}")
    @PreAuthorize("hasAuthority('PERMISO_LEER')")
    public ResponseEntity<List<Auditoria>> listarPorUsuario(@PathVariable Integer idUsuario) {
        return ResponseEntity.ok(auditoriaService.listarPorUsuario(idUsuario));
    }

    // Ver auditoría por módulo
    @GetMapping("/modulo/{modulo}")
    @PreAuthorize("hasAuthority('PERMISO_LEER')")
    public ResponseEntity<List<Auditoria>> listarPorModulo(@PathVariable String modulo) {
        return ResponseEntity.ok(auditoriaService.listarPorModulo(modulo));
    }

    // Ver sesiones activas en este momento
    @GetMapping("/sesiones-activas")
    @PreAuthorize("hasAuthority('PERMISO_LEER')")
    public ResponseEntity<List<SesionActiva>> sesionesActivas() {
        return ResponseEntity.ok(auditoriaService.listarSesionesActivas());
    }
}