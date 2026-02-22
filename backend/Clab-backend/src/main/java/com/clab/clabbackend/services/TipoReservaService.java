package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.TipoReservaDTO;
import com.clab.clabbackend.entities.TipoReserva;
import com.clab.clabbackend.repository.TipoReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TipoReservaService {

    private final TipoReservaRepository tipoReservaRepository;

    // LISTAR
    public List<TipoReserva> listar() {
        List<Object[]> resultados = tipoReservaRepository.listarTipos();

        return resultados.stream().map(r -> {
            TipoReserva tipo = new TipoReserva();
            tipo.setIdTipoReserva((Integer) r[0]);
            tipo.setNombreTipo((String) r[1]);
            tipo.setDescripcion((String) r[2]);
            tipo.setEstado((String) r[3]);
            return tipo;
        }).collect(Collectors.toList());
    }

    // CREAR
    public void crear(TipoReservaDTO dto) {
        tipoReservaRepository.insertar(
                dto.getNombreTipo(),
                dto.getDescripcion()
        );
    }

    // ACTUALIZAR
    public void actualizar(Integer id, TipoReservaDTO dto) {
        tipoReservaRepository.actualizar(
                id,
                dto.getNombreTipo(),
                dto.getDescripcion()
        );
    }

    // ELIMINAR
    public void eliminar(Integer id) {
        tipoReservaRepository.eliminar(id);
    }
}