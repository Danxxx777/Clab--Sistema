package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.LaboratorioDTO;
import com.clab.clabbackend.entities.Laboratorio;
import com.clab.clabbackend.entities.Sede;
import com.clab.clabbackend.repository.LaboratorioRepository;
import com.clab.clabbackend.repository.SedeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LaboratorioService {

    @Autowired
    private LaboratorioRepository laboratorioRepository;

    @Autowired
    private SedeRepository sedeRepository;

    public Laboratorio crear(LaboratorioDTO dto) {
        // Buscar la sede
        Sede sede = sedeRepository.findById(dto.getIdSede())
                .orElseThrow(() -> new RuntimeException("Sede no encontrada con id: " + dto.getIdSede()));

        Integer nuevoCodigo = generarNuevoCodigo();

        Laboratorio laboratorio = new Laboratorio();
        laboratorio.setCodLaboratorio(nuevoCodigo);

        laboratorio.setNombreLab(dto.getNombreLab());
        laboratorio.setUbicacion(dto.getUbicacion());
        laboratorio.setCapacidadEstudiantes(dto.getCapacidadEstudiantes());
        laboratorio.setNumeroEquipos(dto.getNumeroEquipos());
        laboratorio.setDescripcion(dto.getDescripcion());
        laboratorio.setEstadoLab(dto.getEstadoLab() != null ? dto.getEstadoLab() : "Disponible");
        laboratorio.setSede(sede);

        return laboratorioRepository.save(laboratorio);
    }

    public List<Laboratorio> listar() {
        return laboratorioRepository.findAll();
    }

    public Laboratorio actualizar(Integer codLaboratorio, LaboratorioDTO dto) {
        Laboratorio laboratorio = laboratorioRepository.findById(codLaboratorio)
                .orElseThrow(() -> new RuntimeException("Laboratorio no encontrado con código: " + codLaboratorio));

        // Buscar la sede si cambió
        Sede sede = sedeRepository.findById(dto.getIdSede())
                .orElseThrow(() -> new RuntimeException("Sede no encontrada con id: " + dto.getIdSede()));

        laboratorio.setNombreLab(dto.getNombreLab());
        laboratorio.setUbicacion(dto.getUbicacion());
        laboratorio.setCapacidadEstudiantes(dto.getCapacidadEstudiantes());
        laboratorio.setNumeroEquipos(dto.getNumeroEquipos());
        laboratorio.setDescripcion(dto.getDescripcion());
        laboratorio.setEstadoLab(dto.getEstadoLab());
        laboratorio.setSede(sede);

        return laboratorioRepository.save(laboratorio);
    }

    private Integer generarNuevoCodigo() {
        List<Laboratorio> laboratorios = laboratorioRepository.findAll();

        if (laboratorios.isEmpty()) {
            return 1;
        }

        Integer maxCodigo = laboratorios.stream()
                .map(Laboratorio::getCodLaboratorio)
                .max(Integer::compareTo)
                .orElse(0);

        return maxCodigo + 1;
    }


    public void eliminar(Integer codLaboratorio) {
        if (!laboratorioRepository.existsById(codLaboratorio)) {
            throw new RuntimeException("Laboratorio no encontrado con código: " + codLaboratorio);
        }
        laboratorioRepository.deleteById(codLaboratorio);
    }

    public Laboratorio obtenerPorId(Integer codLaboratorio) {
        return laboratorioRepository.findById(codLaboratorio)
                .orElseThrow(() -> new RuntimeException("Laboratorio no encontrado con código: " + codLaboratorio));
    }
}