package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.DecanoResponseDTO;
import com.clab.clabbackend.dto.FacultadDTO;
import com.clab.clabbackend.dto.FacultadResponseDTO;
import com.clab.clabbackend.repository.FacultadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FacultadService {

    private final FacultadRepository facultadRepository;

    public List<FacultadResponseDTO> listar() {
        List<Object[]> resultados = facultadRepository.listarSP();

        return resultados.stream().map(r -> new FacultadResponseDTO(
                (Integer) r[0],
                (String)  r[1],
                (String)  r[2],
                (String)  r[3],
                (Integer) r[4],
                (String)  r[5],
                r[6] != null ? ((java.sql.Date) r[6]).toLocalDate() : null
        )).toList();
    }

    public List<DecanoResponseDTO> listarDecanos() {
        List<Object[]> resultados = facultadRepository.listarDecanosSP();

        return resultados.stream().map(r -> new DecanoResponseDTO(
                (Integer) r[0],
                (String)  r[1]
        )).toList();
    }

    public void crear(FacultadDTO dto) {
        facultadRepository.insertar(
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getIdDecano(),
                dto.getEstado()

        );
    }

    public void editar(Integer idFacultad, FacultadDTO dto) {
        facultadRepository.actualizar(
                idFacultad,
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getIdDecano(),
                dto.getEstado()
        );
    }

    public void eliminar(Integer idFacultad) {
        facultadRepository.baja(idFacultad);
    }
}