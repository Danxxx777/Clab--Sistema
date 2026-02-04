package com.clab.clabbackend.services;


import com.clab.clabbackend.dto.PerioDTO;
import com.clab.clabbackend.entities.PeriodoAcademico;
import com.clab.clabbackend.repository.PeriodoAcademicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PeriodoAcademicoService {
    @Autowired
    private PeriodoAcademicoRepository periodoAcademicoRepository;

    public PeriodoAcademico crear(PerioDTO dto)
    {
        PeriodoAcademico pa = new PeriodoAcademico();
        pa.setNombrePeriodo(dto.getNombrePeriodo());
        pa.setFechaInicio(dto.getFechaInicio());
        pa.setFechaFin(dto.getFechaFin());
        pa.setFechaCreacion(dto.getFechaCreacion());
        pa.setEstado(dto.getEstado());

        return periodoAcademicoRepository.save(pa);
    }

    public List<PeriodoAcademico> listar()
    {
        return periodoAcademicoRepository.findAll();
    }

    public PeriodoAcademico editar(Integer id, PerioDTO dto)
    {
        PeriodoAcademico pa = periodoAcademicoRepository.findById(id).orElseThrow(() -> new RuntimeException("No se encontro el id"));
        pa.setNombrePeriodo(dto.getNombrePeriodo());
        pa.setFechaInicio(dto.getFechaInicio());
        pa.setFechaFin(dto.getFechaFin());
        pa.setFechaCreacion(dto.getFechaCreacion());
        pa.setEstado(dto.getEstado());

        return periodoAcademicoRepository.save(pa);
    }

    public void eliminar(Integer id)
    {
        PeriodoAcademico pa = periodoAcademicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se encontro el periodo con id: " + id));
        periodoAcademicoRepository.delete(pa);

    }
}
