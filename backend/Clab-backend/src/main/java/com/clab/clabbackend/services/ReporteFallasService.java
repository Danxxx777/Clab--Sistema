package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.ReporteFallasDTO;
import com.clab.clabbackend.repository.ReporteFallasRepository;
import com.clab.clabbackend.repository.UsuarioRepository;
import com.clab.clabbackend.repository.UsuarioRolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReporteFallasService {

    private final ReporteFallasRepository reporteRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioRolRepository usuarioRolRepository;
    private final NotificacionService notificacionService;

    public List<Map<String, Object>> listar() {
        List<Object[]> resultados = reporteRepository.listarReportes();
        List<Map<String, Object>> reportes = new ArrayList<>();

        for (Object[] r : resultados) {
            Map<String, Object> reporte = new HashMap<>();
            reporte.put("idReporte", r[0]);
            reporte.put("fechaReporte", r[1] != null ?
                    ((java.sql.Date) r[1]).toLocalDate() : null);
            reporte.put("descripcionFalla", r[2]);

            Map<String, Object> laboratorio = new HashMap<>();
            laboratorio.put("codLaboratorio", r[3]);
            laboratorio.put("nombreLab", r[4]);
            reporte.put("laboratorio", laboratorio);

            Map<String, Object> equipo = new HashMap<>();
            equipo.put("idEquipo", r[5]);
            equipo.put("nombreEquipo", r[6]);
            equipo.put("marca", r[7]);
            equipo.put("modelo", r[8]);
            reporte.put("equipo", equipo);

            Map<String, Object> usuario = new HashMap<>();
            usuario.put("idUsuario", r[9]);
            usuario.put("email", r[10]);
            reporte.put("usuario", usuario);

            reportes.add(reporte);
        }

        return reportes;
    }

    // CREAR
    public void crear(ReporteFallasDTO dto) {
        reporteRepository.insertar(
                dto.getCodLaboratorio(), dto.getIdEquipo(),
                dto.getIdUsuario(), dto.getDescripcionFalla()
        );

        try {
            Object[] datos = reporteRepository.obtenerDatosNotificacion(
                    dto.getCodLaboratorio(), dto.getIdUsuario()
            );

            if (datos != null) {
                Object[] fila = (datos[0] instanceof Object[])
                        ? (Object[]) datos[0] : datos;

                String labNombre        = fila[0] != null ? fila[0].toString() : "";
                String emailReportador  = fila[1] != null ? fila[1].toString() : "";
                String nombreReportador = fila[2] != null ? fila[2].toString() : "Usuario";
                String descripcion      = fila[3] != null ? fila[3].toString() : "";
                String encargadoEmail   = fila[4] != null ? fila[4].toString() : null;

                // Notificar al Encargado_Lab
                if (encargadoEmail != null) {
                    usuarioRepository.findByEmail(encargadoEmail)
                            .ifPresent(encargado ->
                                    notificacionService.notificarNuevaFalla(
                                            encargado, labNombre, descripcion,
                                            nombreReportador, emailReportador, 0)
                            );
                }

                // Notificar a todos los Administradores
                usuarioRolRepository.findUsuariosByRolNombre("Administradorr")
                        .forEach(admin ->
                                notificacionService.notificarAdminNuevaFalla(
                                        admin, labNombre, descripcion,
                                        nombreReportador, emailReportador, 0)
                        );

                // Notificar a todos los Coordinadores
                usuarioRolRepository.findUsuariosByRolNombre("Coordinador")
                        .forEach(coordinador ->
                                notificacionService.notificarCoordinadorNuevaFalla(
                                        coordinador, labNombre, descripcion,
                                        nombreReportador, emailReportador, 0)
                        );
            }
        } catch (Exception e) {
            System.err.println("Error notificación nueva falla: " + e.getMessage());
        }
    }

    // ELIMINAR
    public void eliminar(Integer id) {
        reporteRepository.eliminar(id);
    }
}