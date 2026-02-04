package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.RolDTO;
import com.clab.clabbackend.entities.Rol;
import com.clab.clabbackend.repository.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class RolService {

    @Autowired
    private RolRepository rolRepository;

    public Rol crear(RolDTO dto) {
        Rol rol = new Rol();
        rol.setNombreRol(dto.getNombreRol());
        rol.setDescripcion(dto.getDescripcion());
        rol.setFechaCreacion(LocalDate.now()); // 🔥 AQUÍ SE GENERA

        return rolRepository.save(rol);
    }

    public List<Rol> listar() {
        return rolRepository.findAll();
    }

    public Rol actualizar(Integer id, RolDTO dto) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        rol.setNombreRol(dto.getNombreRol());
        rol.setDescripcion(dto.getDescripcion());

        return rolRepository.save(rol);
    }

    public void eliminar(Integer id) {
        rolRepository.deleteById(id);
    }
}
