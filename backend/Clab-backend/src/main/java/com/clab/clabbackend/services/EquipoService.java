package com.clab.clabbackend.services;

import com.clab.clabbackend.entities.Equipo;
import com.clab.clabbackend.entities.Laboratorio;
import com.clab.clabbackend.entities.TipoEquipo;
import com.clab.clabbackend.repository.EquipoRepository;
import com.clab.clabbackend.repository.LaboratorioRepository;
import com.clab.clabbackend.repository.TipoEquipoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipoService {

    private final EquipoRepository equipoRepository;
    private final TipoEquipoRepository tipoEquipoRepository;
    private final LaboratorioRepository laboratorioRepository;


    public List<Equipo> listar() {
        return equipoRepository.findAll();
    }


//     estooooooo agregueeee
    public List<Equipo> listarPorLaboratorio(Integer codLaboratorio) {
        return equipoRepository.findByLaboratorioCodLaboratorio(codLaboratorio);
    }



// estoooo

    public Equipo crear(
            String numeroSerie,
            String nombreEquipo,
            String marca,
            String modelo,
            String nombreTipoEquipo,
            String estado,
            String nombreLaboratorio,
            String ubicacionFisica,
            LocalDate fechaAdquisicion
    ) {

        TipoEquipo tipoEquipo = tipoEquipoRepository
                .findByNombreTipo(nombreTipoEquipo)
                .orElseThrow(() -> new RuntimeException("Tipo de equipo no existe"));

        Laboratorio laboratorio = laboratorioRepository
                .findByNombreLab(nombreLaboratorio)
                .orElseThrow(() -> new RuntimeException("Laboratorio no existe"));

        Equipo equipo = new Equipo();
        equipo.setNumeroSerie(numeroSerie);
        equipo.setNombreEquipo(nombreEquipo);
        equipo.setMarca(marca);
        equipo.setModelo(modelo);
        equipo.setTipoEquipo(tipoEquipo);
        equipo.setEstado(estado);
        equipo.setLaboratorio(laboratorio);
        equipo.setUbicacionFisica(ubicacionFisica);
        equipo.setFechaAdquisicion(fechaAdquisicion);
        equipo.setFechaRegistro(LocalDate.now());
        equipo.setUltimoReporte(LocalDate.now());

        return equipoRepository.save(equipo);
    }


    public Equipo editar(
            Integer idEquipo,
            String numeroSerie,
            String nombreEquipo,
            String marca,
            String modelo,
            String nombreTipoEquipo,
            String estado,
            String nombreLaboratorio,
            String ubicacionFisica,
            LocalDate fechaAdquisicion
    ) {

        Equipo equipo = equipoRepository.findById(idEquipo)
                .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));

        TipoEquipo tipoEquipo = tipoEquipoRepository
                .findByNombreTipo(nombreTipoEquipo)
                .orElseThrow(() -> new RuntimeException("Tipo de equipo no existe"));

        Laboratorio laboratorio = laboratorioRepository
                .findByNombreLab(nombreLaboratorio)
                .orElseThrow(() -> new RuntimeException("Laboratorio no existe"));

        equipo.setNumeroSerie(numeroSerie);
        equipo.setNombreEquipo(nombreEquipo);
        equipo.setMarca(marca);
        equipo.setModelo(modelo);
        equipo.setTipoEquipo(tipoEquipo);
        equipo.setEstado(estado);
        equipo.setLaboratorio(laboratorio);
        equipo.setUbicacionFisica(ubicacionFisica);
        equipo.setFechaAdquisicion(fechaAdquisicion);
        equipo.setUltimoReporte(LocalDate.now());

        return equipoRepository.save(equipo);
    }

    public void eliminar(Integer idEquipo) {
        if (!equipoRepository.existsById(idEquipo)) {
            throw new RuntimeException("Equipo no encontrado");
        }
        equipoRepository.deleteById(idEquipo);
    }
}
