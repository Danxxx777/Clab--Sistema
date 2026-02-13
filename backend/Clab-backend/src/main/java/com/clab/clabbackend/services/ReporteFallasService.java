package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.ReporteFallasDTO;
import com.clab.clabbackend.entities.*;
import com.clab.clabbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReporteFallasService {

    @Autowired
    private ReporteFallasRepository reporteRepository;

    @Autowired
    private LaboratorioRepository laboratorioRepository;

    @Autowired
    private EquipoRepository equipoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public ReporteFallas crear(ReporteFallasDTO dto) {

        Laboratorio laboratorio = laboratorioRepository.findById(dto.getCodLaboratorio())
                .orElseThrow(() -> new RuntimeException("Laboratorio no encontrado"));

        Equipo equipo = equipoRepository.findById(dto.getIdEquipo())
                .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));


        if (!equipo.getLaboratorio().getCodLaboratorio()
                .equals(laboratorio.getCodLaboratorio())) {
            throw new RuntimeException("El equipo no pertenece al laboratorio seleccionado");
        }

        ReporteFallas reporte = new ReporteFallas();
        reporte.setLaboratorio(laboratorio);
        reporte.setEquipo(equipo);
        reporte.setUsuario(usuario);
        reporte.setDescripcionFalla(dto.getDescripcionFalla());
        reporte.setFechaReporte(LocalDate.now());


        if (equipo.getEstado() != null &&
                equipo.getEstado().equalsIgnoreCase("OPERATIVO")) {

            equipo.setEstado("MANTENIMIENTO");
        }


        equipo.setUltimoReporte(LocalDate.now());


        equipoRepository.save(equipo);


        return reporteRepository.save(reporte);


    }

    public List<ReporteFallas> listar() {
        return reporteRepository.findAll();
    }

    public ReporteFallas obtenerPorId(Integer id) {
        return reporteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado"));
    }

    public void eliminar(Integer id) {
        if (!reporteRepository.existsById(id)) {
            throw new RuntimeException("Reporte no encontrado");
        }
        reporteRepository.deleteById(id);
    }
}
