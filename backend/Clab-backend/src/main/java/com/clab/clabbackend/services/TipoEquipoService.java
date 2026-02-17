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

    // CREAR
    public void crear(TipoEquipoDTO dto) {
        tipoEquipoRepository.insertar(
                dto.getNombre(),
                dto.getDescripcion()
        );
    }

    // LISTAR
    public List<TipoEquipo> listar() {
        return tipoEquipoRepository.listarActivos();
    }

    // ACTUALIZAR
    public void actualizar(Integer id, TipoEquipoDTO dto) {
        tipoEquipoRepository.actualizarSP(
                id,
                dto.getNombre(),
                dto.getDescripcion()
        );
    }

    // BAJA LOGICA
    public void eliminar(Integer id) {
        tipoEquipoRepository.baja(id);
    }
}
