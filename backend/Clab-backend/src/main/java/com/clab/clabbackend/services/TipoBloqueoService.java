package com.clab.clabbackend.services;


import com.clab.clabbackend.dto.TipoBloqueoDTO;
import com.clab.clabbackend.dto.TipoReservaDTO;
import com.clab.clabbackend.entities.TipoBloqueo;
import com.clab.clabbackend.repository.TipoBloqueoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TipoBloqueoService {
    private final TipoBloqueoRepository tipoBloqueoRepository;

    //Listar
    public List<TipoBloqueo> listar()
    {
        List<Object[]> resultado = tipoBloqueoRepository.listarTipos();

        return resultado.stream().map(r -> {
          TipoBloqueo tipoBloqueo = new TipoBloqueo();
          tipoBloqueo.setIdTipoBloqueo((Integer) r[0]);
          tipoBloqueo.setNombreTipo((String) r[1]);
          tipoBloqueo.setDescripcion((String) r[2]);
          tipoBloqueo.setEstado((String) r[3]);
          return tipoBloqueo;
        }).collect(Collectors.toList());
    }

    //Crear
    public void crear(TipoBloqueoDTO dto)
    {
        tipoBloqueoRepository.insertar(
                dto.getNombreTipo(),
                dto.getDescripcion(),
                dto.getEstado()
        );
    }

    // Actualizar
    public void actualizar(Integer id, TipoBloqueoDTO dto)
    {
        tipoBloqueoRepository.actualizar(
                id,
                dto.getNombreTipo(),
                dto.getDescripcion(),
                dto.getEstado()
        );
    }

    // Eliminar
    public void eliminar(Integer id)
    {
        tipoBloqueoRepository.eliminar(id);
    }
}
