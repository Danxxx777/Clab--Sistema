package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.LaboratorioDTO;
import com.clab.clabbackend.entities.Laboratorio;
import com.clab.clabbackend.entities.Sede;

import com.clab.clabbackend.repository.LaboratorioRepository;
import com.clab.clabbackend.repository.SedeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
public class LaboratorioService {

    @Autowired
    private LaboratorioRepository laboratorioRepository;

    @Autowired
    private SedeRepository sedeRepository;


    @Autowired
    private EntityManager entityManager;

    private void registrarAuditoria(Integer actorId, String actorUsuario, String accion,
                                    String descripcion, String ip, String resultado,
                                    Integer idRegistro, String datosAntes, String datosDespues) {
        entityManager.createNativeQuery(
                        "INSERT INTO usuarios.u_auditoria " +
                                "(id_usuario, usuario, accion, modulo, tabla_afectada, id_registro_afectado, " +
                                "descripcion, ip, resultado, fecha_hora, datos_anteriores, datos_nuevos) " +
                                "VALUES (?1, ?2, ?3, 'LABORATORIOS', 'laboratorio', ?4, ?5, ?6, ?7, NOW(), ?8, ?9)"
                )
                .setParameter(1, actorId)
                .setParameter(2, actorUsuario)
                .setParameter(3, accion)
                .setParameter(4, idRegistro)
                .setParameter(5, descripcion)
                .setParameter(6, ip)
                .setParameter(7, resultado)
                .setParameter(8, datosAntes)
                .setParameter(9, datosDespues)
                .executeUpdate();
    }

    private String capturarLabJson(Laboratorio lab) {
        return String.format(
                "{\"cod_laboratorio\":%d,\"nombre\":\"%s\",\"ubicacion\":\"%s\"," +
                        "\"capacidad_estudiantes\":%d,\"numero_equipos\":%d," +
                        "\"descripcion\":\"%s\",\"estado\":\"%s\",\"sede_id\":%d}",
                lab.getCodLaboratorio(),
                lab.getNombreLab()            != null ? lab.getNombreLab()            : "",
                lab.getUbicacion()            != null ? lab.getUbicacion()            : "",
                lab.getCapacidadEstudiantes() != null ? lab.getCapacidadEstudiantes() : 0,
                lab.getNumeroEquipos()        != null ? lab.getNumeroEquipos()        : 0,
                lab.getDescripcion()          != null ? lab.getDescripcion()          : "",
                lab.getEstadoLab()            != null ? lab.getEstadoLab()            : "",
                lab.getSede()                 != null ? lab.getSede().getIdSede()     : 0
        );
    }

    // ─── LISTAR ──────────────────────────────────────────────────────────────
    public List<LaboratorioDTO> listar() {
        return laboratorioRepository.findAll().stream().map(lab -> {
            LaboratorioDTO dto = new LaboratorioDTO();
            dto.setCodLaboratorio(lab.getCodLaboratorio());
            dto.setNombreLab(lab.getNombreLab());
            dto.setUbicacion(lab.getUbicacion());
            dto.setCapacidadEstudiantes(lab.getCapacidadEstudiantes());
            dto.setNumeroEquipos(lab.getNumeroEquipos());
            dto.setDescripcion(lab.getDescripcion());
            dto.setEstadoLab(lab.getEstadoLab());
            dto.setIdSede(lab.getSede() != null ? lab.getSede().getIdSede() : null);
            dto.setNombreSede(lab.getSede() != null ? lab.getSede().getNombre() : null);



            return dto;
        }).toList();
    }

    // ─── CREAR ───────────────────────────────────────────────────────────────
    @Transactional
    public Laboratorio crear(LaboratorioDTO dto, Integer actorId, String actorUsuario, String ip) {
        Sede sede = sedeRepository.findById(dto.getIdSede())
                .orElseThrow(() -> new RuntimeException("Sede no encontrada con id: " + dto.getIdSede()));
        try {
            Laboratorio lab = new Laboratorio();
            lab.setCodLaboratorio(generarNuevoCodigo());
            lab.setNombreLab(dto.getNombreLab());
            lab.setUbicacion(dto.getUbicacion());
            lab.setCapacidadEstudiantes(dto.getCapacidadEstudiantes());
            lab.setNumeroEquipos(dto.getNumeroEquipos());
            lab.setDescripcion(dto.getDescripcion());
            lab.setEstadoLab(dto.getEstadoLab() != null ? dto.getEstadoLab() : "Disponible");
            lab.setSede(sede);
            Laboratorio guardado = laboratorioRepository.save(lab);

            registrarAuditoria(actorId, actorUsuario, "CREAR_LABORATORIO",
                    "Creó el laboratorio: " + guardado.getNombreLab(),
                    ip, "EXITOSO", guardado.getCodLaboratorio(),
                    null, capturarLabJson(guardado));
            return guardado;
        } catch (Exception e) {
            registrarAuditoria(actorId, actorUsuario, "CREAR_LABORATORIO",
                    "Error al crear laboratorio: " + dto.getNombreLab() + " | " + e.getMessage(),
                    ip, "FALLIDO", null, null, null);
            throw e;
        }
    }

    // ─── ACTUALIZAR ──────────────────────────────────────────────────────────
    @Transactional
    public Laboratorio actualizar(Integer codLaboratorio, LaboratorioDTO dto,
                                  Integer actorId, String actorUsuario, String ip) {
        Laboratorio lab = laboratorioRepository.findById(codLaboratorio)
                .orElseThrow(() -> new RuntimeException("Laboratorio no encontrado: " + codLaboratorio));
        Sede sede = sedeRepository.findById(dto.getIdSede())
                .orElseThrow(() -> new RuntimeException("Sede no encontrada: " + dto.getIdSede()));

        String datosAntes = capturarLabJson(lab);
        try {
            lab.setNombreLab(dto.getNombreLab());
            lab.setUbicacion(dto.getUbicacion());
            lab.setCapacidadEstudiantes(dto.getCapacidadEstudiantes());
            lab.setNumeroEquipos(dto.getNumeroEquipos());
            lab.setDescripcion(dto.getDescripcion());
            lab.setEstadoLab(dto.getEstadoLab());
            lab.setSede(sede);
            Laboratorio actualizado = laboratorioRepository.save(lab);

            registrarAuditoria(actorId, actorUsuario, "EDITAR_LABORATORIO",
                    "Actualizó el laboratorio: " + actualizado.getNombreLab(),
                    ip, "EXITOSO", codLaboratorio,
                    datosAntes, capturarLabJson(actualizado));
            return actualizado;
        } catch (Exception e) {
            registrarAuditoria(actorId, actorUsuario, "EDITAR_LABORATORIO",
                    "Error al actualizar laboratorio id: " + codLaboratorio + " | " + e.getMessage(),
                    ip, "FALLIDO", codLaboratorio, datosAntes, null);
            throw e;
        }
    }

    private Integer generarNuevoCodigo() {
        List<Laboratorio> laboratorios = laboratorioRepository.findAll();
        if (laboratorios.isEmpty()) return 1;
        return laboratorios.stream()
                .map(Laboratorio::getCodLaboratorio)
                .max(Integer::compareTo)
                .orElse(0) + 1;
    }

    // ─── ELIMINAR ────────────────────────────────────────────────────────────
    @Transactional
    public void eliminar(Integer codLaboratorio, Integer actorId, String actorUsuario, String ip) {
        Laboratorio lab = laboratorioRepository.findById(codLaboratorio)
                .orElseThrow(() -> new RuntimeException("Laboratorio no encontrado: " + codLaboratorio));
        String datosAntes = capturarLabJson(lab);
        try {
            laboratorioRepository.deleteById(codLaboratorio);
            registrarAuditoria(actorId, actorUsuario, "ELIMINAR_LABORATORIO",
                    "Eliminó el laboratorio: " + lab.getNombreLab(),
                    ip, "EXITOSO", codLaboratorio, datosAntes, null);
        } catch (Exception e) {
            registrarAuditoria(actorId, actorUsuario, "ELIMINAR_LABORATORIO",
                    "Error al eliminar laboratorio id: " + codLaboratorio + " | " + e.getMessage(),
                    ip, "FALLIDO", codLaboratorio, datosAntes, null);
            throw e;
        }
    }

    public Laboratorio obtenerPorId(Integer codLaboratorio) {
        return laboratorioRepository.findById(codLaboratorio)
                .orElseThrow(() -> new RuntimeException("Laboratorio no encontrado con código: " + codLaboratorio));
    }
}