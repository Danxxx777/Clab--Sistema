package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.EquipoDTO;
import com.clab.clabbackend.entities.Equipo;
import com.clab.clabbackend.services.EquipoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/equipos")
@RequiredArgsConstructor
public class EquipoController {

    private final EquipoService equipoService;

    @GetMapping
    public ResponseEntity<List<Equipo>> listar() {
        return ResponseEntity.ok(equipoService.listar());
    }

    @PostMapping
    public ResponseEntity<Equipo> crear(@RequestBody EquipoDTO dto) {
        Equipo equipo = equipoService.crear(
                dto.getNumeroSerie(),
                dto.getNombreEquipo(),
                dto.getMarca(),
                dto.getModelo(),
                dto.getTipoEquipo(),
                dto.getEstado(),
                dto.getLaboratorio(),
                dto.getUbicacionFisica(),
                dto.getFechaAdquisicion()
        );
        return ResponseEntity.ok(equipo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Equipo> editar(
            @PathVariable Integer id,
            @RequestBody EquipoDTO dto
    ) {
        Equipo equipo = equipoService.editar(
                id,
                dto.getNumeroSerie(),
                dto.getNombreEquipo(),
                dto.getMarca(),
                dto.getModelo(),
                dto.getTipoEquipo(),
                dto.getEstado(),
                dto.getLaboratorio(),
                dto.getUbicacionFisica(),
                dto.getFechaAdquisicion()
        );
        return ResponseEntity.ok(equipo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        equipoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/porLaboratorio/{codLaboratorio}")
    public ResponseEntity<List<Equipo>> listarPorLaboratorio(@PathVariable Integer codLaboratorio) {
        return ResponseEntity.ok(equipoService.listarPorLaboratorio(codLaboratorio));
    }



}

