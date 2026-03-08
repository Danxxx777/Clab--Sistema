package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.EquipoDTO;
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
    public void crear(EquipoDTO dto) {

        equipoRepository.insertar(
                dto.getNumeroSerie(),
                dto.getNombreEquipo(),
                dto.getMarca(),
                dto.getModelo(),
                dto.getIdTipoEquipo(),
                dto.getEstado(),
                dto.getCodLaboratorio(),
                dto.getUbicacionFisica(),
                dto.getFechaAdquisicion()
        );
    }
    public List<Equipo> listar() {
        List<Object[]> resultados = equipoRepository.listarSP();

        return resultados.stream().map(r -> {
            Equipo equipo = new Equipo();
            equipo.setIdEquipo((Integer) r[0]);
            equipo.setNumeroSerie((String) r[1]);
            equipo.setNombreEquipo((String) r[2]);
            equipo.setMarca((String) r[3]);
            equipo.setModelo((String) r[4]);

            TipoEquipo tipo = new TipoEquipo();
            tipo.setIdTipoEquipo((Integer) r[5]);
            tipo.setNombreTipo((String) r[6]);
            equipo.setTipoEquipo(tipo);

            Laboratorio lab = new Laboratorio();
            lab.setCodLaboratorio((Integer) r[7]);
            lab.setNombreLab((String) r[8]);
            equipo.setLaboratorio(lab);

            equipo.setEstado((String) r[9]);
            equipo.setUbicacionFisica((String) r[10]);

            equipo.setFechaAdquisicion(
                    r[11] != null ? ((java.sql.Date) r[11]).toLocalDate() : null
            );
            equipo.setFechaRegistro(
                    r[12] != null ? ((java.sql.Date) r[12]).toLocalDate() : null
            );
            equipo.setUltimoReporte(
                    r[13] != null ? ((java.sql.Date) r[13]).toLocalDate() : null
            );

            return equipo;
        }).toList();
    }

    public List<Equipo> equiposPorLaboratorio(Integer codLaboratorio) {
        List<Object[]> resultados = equipoRepository.equiposPorLaboratorio(codLaboratorio);

        return resultados.stream().map(r -> {
            Equipo equipo = new Equipo();
            equipo.setIdEquipo((Integer) r[0]);
            equipo.setNombreEquipo((String) r[1]);
            equipo.setMarca((String) r[2]);
            equipo.setModelo((String) r[3]);
            equipo.setEstado((String) r[4]);
            return equipo;
        }).toList();
    }



    public void editar(Integer idEquipo, EquipoDTO dto) {

        equipoRepository.actualizar(
                idEquipo,
                dto.getNumeroSerie(),
                dto.getNombreEquipo(),
                dto.getMarca(),
                dto.getModelo(),
                dto.getIdTipoEquipo(),
                dto.getEstado(),
                dto.getCodLaboratorio(),
                dto.getUbicacionFisica(),
                dto.getFechaAdquisicion()
        );
    }

    public void eliminar(Integer idEquipo) {
        equipoRepository.baja(idEquipo);
    }
}
