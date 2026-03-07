package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.AsistenciaUsuarioDTO;
import com.clab.clabbackend.services.AsistenciaUsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/asistencia")
public class AsistenciaUsuarioController {

    private final AsistenciaUsuarioService asistenciaUsuarioService;

    public AsistenciaUsuarioController(AsistenciaUsuarioService asistenciaUsuarioService) {
        this.asistenciaUsuarioService = asistenciaUsuarioService;
    }

    @GetMapping("/hoy")
    public ResponseEntity<List<Map<String, Object>>> listarReservasHoy() {
        return ResponseEntity.ok(asistenciaUsuarioService.listarReservasHoy());
    }

    @PostMapping("/registrar")
    public ResponseEntity<Void> registrarAsistencia(@RequestBody AsistenciaUsuarioDTO dto) {
        asistenciaUsuarioService.registrarAsistencia(
                dto.getIdReserva(),
                dto.getIdUsuario(),
                dto.getObservaciones()
        );
        return ResponseEntity.ok().build();
    }

    @GetMapping("/bloqueado/{idUsuario}")
    public ResponseEntity<Boolean> usuarioBloqueado(@PathVariable Integer idUsuario) {
        return ResponseEntity.ok(asistenciaUsuarioService.usuarioBloqueado(idUsuario));
    }

    @PostMapping("/verificar-bloqueo/{idUsuario}")
    public ResponseEntity<Void> verificarBloqueo(@PathVariable Integer idUsuario) {
        asistenciaUsuarioService.verificarBloqueo(idUsuario);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/falta")
    public ResponseEntity<Void> registrarFalta(@RequestBody AsistenciaUsuarioDTO dto) {
        asistenciaUsuarioService.registrarFalta(dto.getIdReserva(), dto.getIdUsuario());
        return ResponseEntity.ok().build();
    }
}