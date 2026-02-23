package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.SedeDTO;
import com.clab.clabbackend.entities.Sede;
import com.clab.clabbackend.repository.SedeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SedeService {

    private final SedeRepository sedeRepository;

    // LISTAR
    public List<Sede> listar() {
        List<Object[]> resultados = sedeRepository.listarSedes();

        return resultados.stream().map(r -> {
            Sede sede = new Sede();
            sede.setIdSede((Integer) r[0]);
            sede.setNombre((String) r[1]);
            sede.setDireccion((String) r[2]);
            sede.setTelefono((String) r[3]);
            sede.setEmail((String) r[4]);
            sede.setEstado((String) r[5]);
            return sede;
        }).collect(Collectors.toList());
    }

    // CREAR
    public void crear(SedeDTO dto) {
        sedeRepository.insertar(
                dto.getNombre(),
                dto.getDireccion(),
                dto.getTelefono(),
                dto.getEmail()
        );
    }

    // ACTUALIZAR
    public void actualizar(Integer id, SedeDTO dto) {
        sedeRepository.actualizar(
                id,
                dto.getNombre(),
                dto.getDireccion(),
                dto.getTelefono(),
                dto.getEmail()
        );
    }

    // ELIMINAR
    public void eliminar(Integer id) {
        sedeRepository.eliminar(id);
    }
}