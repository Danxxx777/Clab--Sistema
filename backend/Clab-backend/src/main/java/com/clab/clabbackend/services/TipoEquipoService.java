package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.TipoEquipoDTO;
import com.clab.clabbackend.entities.TipoEquipo;
import com.clab.clabbackend.repository.TipoEquipoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TipoEquipoService {

    @Autowired
    private TipoEquipoRepository tipoEquipoRepository;

    public TipoEquipo crear(TipoEquipoDTO dto) {
        TipoEquipo tipo = new TipoEquipo();
        tipo.setNombreTipo(dto.getNombre());
        tipo.setDescripcion(dto.getDescripcion());

        return tipoEquipoRepository.save(tipo);
    }

    public List<TipoEquipo> listar() {
        return tipoEquipoRepository.findAll();
    }

    public TipoEquipo actualizar(Integer id, TipoEquipoDTO dto) {
        TipoEquipo tipo = tipoEquipoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de equipo no encontrado"));

        tipo.setNombreTipo(dto.getNombre());
        tipo.setDescripcion(dto.getDescripcion());

        return tipoEquipoRepository.save(tipo);
    }

    public void eliminar(Integer id) {
        tipoEquipoRepository.deleteById(id);
    }
}
