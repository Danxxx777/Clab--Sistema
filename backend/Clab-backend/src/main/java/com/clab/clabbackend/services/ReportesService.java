package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.reporte.*;
import com.clab.clabbackend.dto.reporte.ReporteEquipoDTO.*;
import com.clab.clabbackend.dto.reporte.ReporteUsoDTO.*;
import com.clab.clabbackend.dto.reporte.ReporteFallasDTO.*;
import com.clab.clabbackend.dto.reporte.ReporteReservasDTO.*;
import com.clab.clabbackend.dto.reporte.ReporteAsistenciaDTO.*;
import com.clab.clabbackend.dto.reporte.ReporteUsuariosDTO.*;
import com.clab.clabbackend.dto.reporte.ReporteBloqueosDTO.*;
import com.clab.clabbackend.dto.reporte.ReporteAcademicoDTO.*;
import com.clab.clabbackend.entities.Usuario;
import com.clab.clabbackend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportesService {

    private final EquipoRepository           equipoRepository;
    private final ReservaRepository          reservaRepository;
    private final ReporteFallasRepository    reporteFallasRepository;
    private final AsistenciaUsuarioRepository asistenciaUsuarioRepository;
    private final UsuarioRepository          usuarioRepository;
    private final BloqueoLabRepository       bloqueoLabRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // RESUMEN GLOBAL
    // ─────────────────────────────────────────────────────────────────────────

    public ResumenGlobalDTO getResumenGlobal() {
        long reservas    = reservaRepository.count();
        long fallas      = reporteFallasRepository.count();
        long usuarios    = usuarioRepository.count();
        long equipos     = equipoRepository.count();
        long bloqueos    = bloqueoLabRepository.count();

        // Asistencias: usamos listarReservasHoy() solo para contar — o count() directo
        long asistencias = asistenciaUsuarioRepository.count();

        return new ResumenGlobalDTO(reservas, asistencias, fallas, usuarios, equipos, bloqueos);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REPORTE EQUIPOS (ya existía, lo mantenemos igual)
    // ─────────────────────────────────────────────────────────────────────────

    public ReporteEquipoDTO getReporteEquipos(Integer laboratorio, String estado) {
        List<Object[]> rows = equipoRepository.reporteEquipos(laboratorio, estado);

        List<ReporteEquipoDTO.EquipoItem> datos = rows.stream().map(r -> {
            ReporteEquipoDTO.EquipoItem item = new ReporteEquipoDTO.EquipoItem();
            item.setSerie(      str(r[0]));
            item.setNombre(     str(r[1]));
            item.setTipo(       str(r[2]));
            item.setLaboratorio(str(r[3]));
            item.setEstado(     str(r[4]));
            item.setMarca(      str(r[5]));
            item.setModelo(     str(r[6]));
            item.setUbicacion(  str(r[7]));
            return item;
        }).collect(Collectors.toList());

        long total         = datos.size();
        long operativos    = datos.stream().filter(d -> "OPERATIVO".equalsIgnoreCase(d.getEstado())).count();
        long mantenimiento = datos.stream().filter(d -> "MANTENIMIENTO".equalsIgnoreCase(d.getEstado())).count();
        long fuera         = datos.stream().filter(d ->
                "FUERA".equalsIgnoreCase(d.getEstado()) || "INACTIVO".equalsIgnoreCase(d.getEstado())).count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalEquipos",  total);
        stats.put("operativos",    operativos);
        stats.put("mantenimiento", mantenimiento);
        stats.put("fueraServicio", fuera);

        List<ReporteEquipoDTO.GraficaItem> grafica1 = buildGrafica(
                datos.stream().collect(Collectors.groupingBy(ReporteEquipoDTO.EquipoItem::getLaboratorio, Collectors.counting()))
        );
        List<ReporteEquipoDTO.GraficaItem> grafica2 = buildGrafica(
                datos.stream().collect(Collectors.groupingBy(ReporteEquipoDTO.EquipoItem::getEstado, Collectors.counting()))
        );

        ReporteEquipoDTO response = new ReporteEquipoDTO();
        response.setStats(stats);
        response.setGrafica1(grafica1);
        response.setGrafica2(grafica2);
        response.setDatos(datos);
        return response;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REPORTE USO DE LABORATORIOS
    // ─────────────────────────────────────────────────────────────────────────

    public ReporteUsoDTO getReporteUso(Integer laboratorio, String fechaInicio, String fechaFin, String estado) {
        // Usamos fn_listar_reservas() que ya existe
        List<Object[]> rows = reservaRepository.listarReservas();

        List<UsoItem> datos = rows.stream()
                .map(r -> {
                    UsoItem item = new UsoItem();
                    // columnas de fn_listar_reservas():
                    // [0] id_reserva, [1] laboratorio, [2] usuario, [3] fecha_reserva,
                    // [4] hora_inicio, [5] hora_fin, [6] motivo, [7] num_estudiantes,
                    // [8] estado, [9] tipo_reserva, [10] descripcion
                    item.setLaboratorio(    str(r[2]));
                    item.setFecha(          str(r[12]));
                    item.setHorario(        str(r[13]) + " - " + str(r[14]));
                    item.setNumEstudiantes( str(r[16]));
                    item.setTipoReserva(    str(r[11]));
                    item.setEstado(         str(r[17]));
                    return item;
                })
                .filter(i -> laboratorio == null || i.getLaboratorio() != null)
                .filter(i -> estado == null || estado.isBlank() || estado.equalsIgnoreCase(i.getEstado()))
                .filter(i -> estaEnRango(i.getFecha(), fechaInicio, fechaFin))
                .collect(Collectors.toList());

        long total      = datos.size();
        long aprobadas  = datos.stream().filter(d -> "APROBADA".equalsIgnoreCase(d.getEstado())).count();
        long pendientes = datos.stream().filter(d -> "PENDIENTE".equalsIgnoreCase(d.getEstado())).count();
        long canceladas = datos.stream().filter(d -> "CANCELADA".equalsIgnoreCase(d.getEstado())).count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalReservas", total);
        stats.put("aprobadas",     aprobadas);
        stats.put("pendientes",    pendientes);
        stats.put("canceladas",    canceladas);

        List<ReporteUsoDTO.GraficaItem> grafica1 = buildGraficaUso(
                datos.stream().collect(Collectors.groupingBy(UsoItem::getLaboratorio, Collectors.counting()))
        );
        List<ReporteUsoDTO.GraficaItem> grafica2 = buildGraficaUso(
                datos.stream().collect(Collectors.groupingBy(UsoItem::getEstado, Collectors.counting()))
        );

        return new ReporteUsoDTO(stats, grafica1, grafica2, datos);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REPORTE FALLAS
    // ─────────────────────────────────────────────────────────────────────────

    public ReporteFallasDTO getReporteFallas(Integer laboratorio, String fechaInicio, String fechaFin) {
        List<Object[]> rows = reporteFallasRepository.listarReportes();

        // columnas de fn_listar_reportes():
        // [0] id_reporte, [1] equipo, [2] laboratorio, [3] usuario, [4] descripcion_falla, [5] fecha_reporte
        List<FallaItem> datos = rows.stream()
                .map(r -> {
                    FallaItem item = new FallaItem();
                    item.setIdReporte(   str(r[0]));
                    item.setFecha(       str(r[1]));  // fecha_reporte
                    item.setDescripcion( str(r[2]));  // descripcion_falla
                    item.setLaboratorio( str(r[4]));  // nombre_lab
                    item.setEquipo(      str(r[6]));  // nombre_equipo
                    item.setReportadoPor(str(r[10]));
                    return item;
                })
                .filter(i -> laboratorio == null || i.getLaboratorio() != null)
                .filter(i -> estaEnRango(i.getFecha(), fechaInicio, fechaFin))
                .collect(Collectors.toList());

        long total = datos.size();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalFallas",     total);
        stats.put("laboratorios",    datos.stream().map(FallaItem::getLaboratorio).distinct().count());
        stats.put("equiposAfectados",datos.stream().map(FallaItem::getEquipo).distinct().count());

        List<ReporteFallasDTO.GraficaItem> grafica1 = buildGraficaFallas(
                datos.stream().collect(Collectors.groupingBy(FallaItem::getLaboratorio, Collectors.counting()))
        );
        // Top 5 equipos con más fallas
        List<ReporteFallasDTO.GraficaItem> grafica2 = buildGraficaFallas(
                datos.stream().collect(Collectors.groupingBy(FallaItem::getEquipo, Collectors.counting()))
        ).stream().limit(5).collect(Collectors.toList());

        return new ReporteFallasDTO(stats, grafica1, grafica2, datos);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REPORTE RESERVAS
    // ─────────────────────────────────────────────────────────────────────────

    public ReporteReservasDTO getReporteReservas(Integer laboratorio, String fechaInicio, String fechaFin, String estado) {
        List<Object[]> rows = reservaRepository.listarReservas();

        List<ReservaItem> datos = rows.stream()
                .map(r -> {
                    ReservaItem item = new ReservaItem();
                    item.setFecha(          str(r[12]));
                    item.setLaboratorio(    str(r[2]));
                    item.setHorario(        str(r[13]) + " - " + str(r[14]));
                    item.setTipo(    str(r[11]));
                    item.setMotivo(         str(r[15]));
                    item.setNumEstudiantes( str(r[16]));
                    item.setEstado(         str(r[17]));
                    return item;
                })
                .filter(i -> estado == null || estado.isBlank() || estado.equalsIgnoreCase(i.getEstado()))
                .filter(i -> estaEnRango(i.getFecha(), fechaInicio, fechaFin))
                .collect(Collectors.toList());

        long total      = datos.size();
        long aprobadas  = datos.stream().filter(d -> "APROBADA".equalsIgnoreCase(d.getEstado())).count();
        long pendientes = datos.stream().filter(d -> "PENDIENTE".equalsIgnoreCase(d.getEstado())).count();
        long canceladas = datos.stream().filter(d -> "CANCELADA".equalsIgnoreCase(d.getEstado())).count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total",      total);
        stats.put("aprobadas",  aprobadas);
        stats.put("pendientes", pendientes);
        stats.put("canceladas", canceladas);

        List<ReporteReservasDTO.GraficaItem> grafica1 = buildGraficaReservas(
                datos.stream().collect(Collectors.groupingBy(ReservaItem::getLaboratorio, Collectors.counting()))
        );
        List<ReporteReservasDTO.GraficaItem> grafica2 = buildGraficaReservas(
                datos.stream().collect(Collectors.groupingBy(ReservaItem::getEstado, Collectors.counting()))
        );

        return new ReporteReservasDTO(stats, grafica1, grafica2, datos);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REPORTE ASISTENCIA
    // ─────────────────────────────────────────────────────────────────────────

    public ReporteAsistenciaDTO getReporteAsistencia(Integer laboratorio, String fechaInicio, String fechaFin) {
        // Usamos listarReservasHoy() — trae las reservas con asistencia registrada
        List<Object[]> rows = asistenciaUsuarioRepository.listarReservasHoy();

        // columnas de fn_listar_reservas_hoy():
        // [0] id_reserva, [1] laboratorio, [2] docente, [3] fecha_reserva,
        // [4] hora_inicio, [5] hora_fin, [6] estado
        List<AsistenciaItem> datos = rows.stream()
                .map(r -> {
                    AsistenciaItem item = new AsistenciaItem();
                    item.setFecha(        str(r[3]));
                    item.setLaboratorio(  str(r[1]));
                    item.setDocente(      str(r[2]));
                    item.setHoraApertura( str(r[4]));
                    item.setObservaciones("");
                    return item;
                })
                .filter(i -> estaEnRango(i.getFecha(), fechaInicio, fechaFin))
                .collect(Collectors.toList());

        long total = datos.size();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalAsistencias", total);
        stats.put("laboratorios",     datos.stream().map(AsistenciaItem::getLaboratorio).distinct().count());
        stats.put("docentes",         datos.stream().map(AsistenciaItem::getDocente).distinct().count());

        List<ReporteAsistenciaDTO.GraficaItem> grafica1 = buildGraficaAsistencia(
                datos.stream().collect(Collectors.groupingBy(AsistenciaItem::getLaboratorio, Collectors.counting()))
        );
        List<ReporteAsistenciaDTO.GraficaItem> grafica2 = buildGraficaAsistencia(
                datos.stream().collect(Collectors.groupingBy(AsistenciaItem::getDocente, Collectors.counting()))
        );

        return new ReporteAsistenciaDTO(stats, grafica1, grafica2, datos);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REPORTE USUARIOS
    // ─────────────────────────────────────────────────────────────────────────

    public ReporteUsuariosDTO getReporteUsuarios(String estado) {
        List<Usuario> usuarios = usuarioRepository.findAll();

        List<UsuarioItem> datos = usuarios.stream()
                .filter(u -> estado == null || estado.isBlank() || estado.equalsIgnoreCase(u.getEstado()))
                .map(u -> {
                    UsuarioItem item = new UsuarioItem();
                    item.setIdentidad(      u.getIdentidad());
                    item.setNombreCompleto( u.getNombres() + " " + u.getApellidos());
                    item.setEmail(          u.getEmail());
                    item.setUsuario(        u.getUsuario());
                    item.setEstado(         u.getEstado());
                    return item;
                })
                .collect(Collectors.toList());

        long total   = datos.size();
        long activos = datos.stream().filter(d -> "ACTIVO".equalsIgnoreCase(d.getEstado())).count();
        long inactivos = total - activos;

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsuarios", total);
        stats.put("activos",       activos);
        stats.put("inactivos",     inactivos);

        List<ReporteUsuariosDTO.GraficaItem> grafica1 = buildGraficaUsuarios(
                datos.stream().collect(Collectors.groupingBy(UsuarioItem::getEstado, Collectors.counting()))
        );
        // Grafica2: distribución vacía por ahora (roles requeriría join adicional)
        List<ReporteUsuariosDTO.GraficaItem> grafica2 = new ArrayList<>();

        return new ReporteUsuariosDTO(stats, grafica1, grafica2, datos);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REPORTE BLOQUEOS
    // ─────────────────────────────────────────────────────────────────────────

    public ReporteBloqueosDTO getReporteBloqueos(Integer laboratorio, String fechaInicio, String fechaFin, String estado) {
        List<Object[]> rows = bloqueoLabRepository.listar();

        // columnas de fn_listar_bloqueos():
        // [0] id_bloqueo, [1] laboratorio, [2] tipo_bloqueo, [3] motivo,
        // [4] fecha_inicio, [5] fecha_fin, [6] estado
        List<BloqueoItem> datos = rows.stream()
                .map(r -> {
                    BloqueoItem item = new BloqueoItem();
                    item.setLaboratorio( str(r[2]));  // nombre_laboratorio
                    item.setTipo(        str(r[6]));  // nombre_tipo_bloqueo
                    item.setMotivo(      str(r[7]));  // motivo
                    item.setFechaInicio( str(r[8]));  // fecha_inicio
                    item.setFechaFin(    str(r[9]));  // fecha_fin
                    item.setEstado(      str(r[11]));
                    return item;
                })
                .filter(i -> estado == null || estado.isBlank() || estado.equalsIgnoreCase(i.getEstado()))
                .collect(Collectors.toList());

        long total  = datos.size();
        long activos = datos.stream().filter(d -> "ACTIVO".equalsIgnoreCase(d.getEstado())).count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalBloqueos",  total);
        stats.put("activos",        activos);
        stats.put("laboratorios",   datos.stream().map(BloqueoItem::getLaboratorio).distinct().count());

        List<ReporteBloqueosDTO.GraficaItem> grafica1 = buildGraficaBloqueos(
                datos.stream().collect(Collectors.groupingBy(BloqueoItem::getLaboratorio, Collectors.counting()))
        );
        List<ReporteBloqueosDTO.GraficaItem> grafica2 = buildGraficaBloqueos(
                datos.stream().collect(Collectors.groupingBy(BloqueoItem::getTipo, Collectors.counting()))
        );

        return new ReporteBloqueosDTO(stats, grafica1, grafica2, datos);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REPORTE ACADÉMICO
    // ─────────────────────────────────────────────────────────────────────────

    public ReporteAcademicoDTO getReporteAcademico(Integer laboratorio, String fechaInicio, String fechaFin) {
        List<Object[]> rows = reservaRepository.listarReservas();

        // Filtramos solo las que tienen tipo académico (tipoReserva con asignatura)
        List<AcademicoItem> datos = rows.stream()
                .map(r -> {
                    AcademicoItem item = new AcademicoItem();
                    // [0] id_reserva, [1] laboratorio, [2] usuario/docente, [3] fecha_reserva,
                    // [4] hora_inicio, [5] hora_fin, [6] motivo, [7] num_est, [8] estado, [9] tipo_reserva
                    item.setAsignatura(  str(r[9]));   // nombre_asignatura
                    item.setCarrera(str(r[6]));
                    item.setDocente(     str(r[4]));   // nombre_usuario
                    item.setLaboratorio( str(r[2]));   // nombre_lab
                    item.setFecha(       str(r[12]));  // fecha_reserva
                    item.setEstado(      str(r[17]));  // estado
                    return item;
                })
                .filter(i -> estaEnRango(i.getFecha(), fechaInicio, fechaFin))
                .collect(Collectors.toList());

        long total = datos.size();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalClases",    total);
        stats.put("laboratorios",   datos.stream().map(AcademicoItem::getLaboratorio).distinct().count());
        stats.put("docentes",       datos.stream().map(AcademicoItem::getDocente).distinct().count());

        List<ReporteAcademicoDTO.GraficaItem> grafica1 = buildGraficaAcademico(
                datos.stream().collect(Collectors.groupingBy(AcademicoItem::getLaboratorio, Collectors.counting()))
        );
        List<ReporteAcademicoDTO.GraficaItem> grafica2 = buildGraficaAcademico(
                datos.stream().collect(Collectors.groupingBy(AcademicoItem::getDocente, Collectors.counting()))
        );

        return new ReporteAcademicoDTO(stats, grafica1, grafica2, datos);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS PRIVADOS
    // ─────────────────────────────────────────────────────────────────────────

    private String str(Object o) {
        return o != null ? o.toString() : "";
    }

    /** Filtra por rango de fechas. Si no se proveen fechas, deja pasar todo. */
    private boolean estaEnRango(String fechaStr, String desde, String hasta) {
        if ((desde == null || desde.isBlank()) && (hasta == null || hasta.isBlank())) return true;
        try {
            LocalDate fecha = LocalDate.parse(fechaStr.substring(0, 10));
            if (desde != null && !desde.isBlank() && fecha.isBefore(LocalDate.parse(desde))) return false;
            if (hasta != null && !hasta.isBlank() && fecha.isAfter(LocalDate.parse(hasta)))  return false;
            return true;
        } catch (Exception e) {
            return true; // si el formato es raro, dejamos pasar
        }
    }

    /** Construye lista de GraficaItem genérica desde un mapa label→count. */
    private <T> List<T> buildGraficaGenerico(Map<String, Long> mapa, GraficaItemFactory<T> factory) {
        long max = mapa.values().stream().mapToLong(v -> v).max().orElse(1);
        long total = mapa.values().stream().mapToLong(v -> v).sum();
        return mapa.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> factory.create(
                        e.getKey(),
                        e.getValue().intValue(),
                        (int) Math.round(e.getValue() * 100.0 / Math.max(total, 1))
                ))
                .collect(Collectors.toList());
    }

    @FunctionalInterface
    private interface GraficaItemFactory<T> {
        T create(String label, int valor, int pct);
    }

    private List<ReporteEquipoDTO.GraficaItem> buildGrafica(Map<String, Long> mapa) {
        return buildGraficaGenerico(mapa, ReporteEquipoDTO.GraficaItem::new);
    }
    private List<ReporteUsoDTO.GraficaItem> buildGraficaUso(Map<String, Long> mapa) {
        return buildGraficaGenerico(mapa, ReporteUsoDTO.GraficaItem::new);
    }
    private List<ReporteFallasDTO.GraficaItem> buildGraficaFallas(Map<String, Long> mapa) {
        return buildGraficaGenerico(mapa, ReporteFallasDTO.GraficaItem::new);
    }
    private List<ReporteReservasDTO.GraficaItem> buildGraficaReservas(Map<String, Long> mapa) {
        return buildGraficaGenerico(mapa, ReporteReservasDTO.GraficaItem::new);
    }
    private List<ReporteAsistenciaDTO.GraficaItem> buildGraficaAsistencia(Map<String, Long> mapa) {
        return buildGraficaGenerico(mapa, ReporteAsistenciaDTO.GraficaItem::new);
    }
    private List<ReporteUsuariosDTO.GraficaItem> buildGraficaUsuarios(Map<String, Long> mapa) {
        return buildGraficaGenerico(mapa, ReporteUsuariosDTO.GraficaItem::new);
    }
    private List<ReporteBloqueosDTO.GraficaItem> buildGraficaBloqueos(Map<String, Long> mapa) {
        return buildGraficaGenerico(mapa, ReporteBloqueosDTO.GraficaItem::new);
    }
    private List<ReporteAcademicoDTO.GraficaItem> buildGraficaAcademico(Map<String, Long> mapa) {
        return buildGraficaGenerico(mapa, ReporteAcademicoDTO.GraficaItem::new);
    }
}
