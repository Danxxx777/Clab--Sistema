package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.SedeDTO;
import com.clab.clabbackend.entities.Sede;
import com.clab.clabbackend.repository.SedeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SedeService {
    @Autowired
    private SedeRepository sedeRepository;

    public Sede crear(SedeDTO dto)
    {
        Sede sede = new Sede();
        sede.setNombre(dto.getNombre());
        sede.setDireccion(dto.getDireccion());
        sede.setTelefono(dto.getTelefono());
        sede.setEmail(dto.getEmail());
        sede.setEstado(dto.getEstado());

        return  sedeRepository.save(sede);
    }

    public List<Sede>  listar()
    {
        return sedeRepository.findAll();
    }

    public Sede actualizar(Integer id, SedeDTO dto)
    {
        Sede sede = sedeRepository.findById(id).orElseThrow(() -> new RuntimeException("No se encontro el id"));
        sede.setNombre(dto.getNombre());
        sede.setDireccion(dto.getDireccion());
        sede.setTelefono(dto.getTelefono());
        sede.setEmail(dto.getEmail());
        sede.setEstado(dto.getEstado());

        return sedeRepository.save(sede);
    }
}

