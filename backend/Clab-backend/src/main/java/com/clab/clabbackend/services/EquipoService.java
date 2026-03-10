package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.EquipoDTO;
import com.clab.clabbackend.entities.Equipo;
import com.clab.clabbackend.entities.Laboratorio;
import com.clab.clabbackend.entities.TipoEquipo;
import com.clab.clabbackend.repository.EquipoRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipoService {

    private final EquipoRepository equipoRepository;
    private final EntityManager entityManager;

    // ─── CONTEXT ─────────────────────────────────────────────────────────────

    private void setActorContext(Integer actorId, String actorUsuario) {
        entityManager.createNativeQuery(
                        "SELECT set_config('clab.actor_id', :id, true), " +
                                "set_config('clab.actor_usuario', :usuario, true)"
                )
                .setParameter("id",      actorId != null ? actorId.toString() : "0")
                .setParameter("usuario", actorUsuario != null ? actorUsuario : "Sistema")
                .getSingleResult();
    }

    // ─── LISTAR ──────────────────────────────────────────────────────────────

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
            equipo.setFechaAdquisicion(r[11] != null ? ((java.sql.Date) r[11]).toLocalDate() : null);
            equipo.setFechaRegistro(r[12] != null ? ((java.sql.Date) r[12]).toLocalDate() : null);
            equipo.setUltimoReporte(r[13] != null ? ((java.sql.Date) r[13]).toLocalDate() : null);

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

    // ─── CREAR ───────────────────────────────────────────────────────────────

    @Transactional
    public void crear(EquipoDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
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

    // ─── ACTUALIZAR ──────────────────────────────────────────────────────────

    @Transactional
    public void editar(Integer idEquipo, EquipoDTO dto, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
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

    // ─── BAJA LÓGICA ─────────────────────────────────────────────────────────

    @Transactional
    public void eliminar(Integer idEquipo, Integer actorId, String actorUsuario) {
        setActorContext(actorId, actorUsuario);
        equipoRepository.baja(idEquipo);
    }
}