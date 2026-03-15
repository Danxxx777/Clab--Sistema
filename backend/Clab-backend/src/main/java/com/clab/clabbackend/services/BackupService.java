package com.clab.clabbackend.services;

import com.clab.clabbackend.dto.BackupConfigDTO;
import com.clab.clabbackend.dto.BackupRegistroDTO;
import com.clab.clabbackend.dto.BackupRespuestaDTO;
import com.clab.clabbackend.entities.BackupConfig;
import com.clab.clabbackend.entities.BackupRegistro;
import com.clab.clabbackend.repository.BackupConfigRepository;
import com.clab.clabbackend.repository.BackupRegistroRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import javax.sql.DataSource;

@Slf4j
@Service
@RequiredArgsConstructor
public class BackupService {

    // Repositorios
    private final BackupRegistroRepository registroRepository;
    private final BackupConfigRepository   configRepository;
    private final DataSource               dataSource;

    // Configuración desde application.properties
    @Value("${backup.ruta-local:/backups}")
    private String rutaLocal;

    @Value("${backup.db.host:localhost}")
    private String dbHost;

    @Value("${backup.db.port:5432}")
    private String dbPort;

    @Value("${backup.db.nombre:CLAB}")
    private String dbNombre;

    @Value("${backup.db.usuario:postgres}")
    private String dbUsuario;

    @Value("${backup.db.password:}")
    private String dbPassword;

    @Value("${backup.pgdump.path:pg_dump}")
    private String pgDumpPath;

    // Formateador para los nombres de archivo: backup_2024-01-15_02-00-00.sql
    private static final DateTimeFormatter FORMATO_FECHA =
            DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss");

    // SECCIÓN 1: CONFIGURACIÓN
    public BackupConfigDTO obtenerConfiguracion() {
        return configRepository.findById(1L)
                .map(BackupConfigDTO::fromEntity)
                .orElseGet(() -> {
                    // Primera vez que se carga: devuelve config por defecto
                    log.info("No existe configuración de backup, devolviendo valores por defecto");
                    return BackupConfigDTO.builder()
                            .frecuencia("DIARIO")
                            .horas(List.of("02:00"))
                            .guardarLocal(true)
                            .guardarDrive(false)
                            .activo(false)
                            .retencion(10)
                            .build();
                });
    }

    @Transactional
    public BackupRespuestaDTO guardarConfiguracion(BackupConfigDTO dto) {
        try {
            BackupConfig entidad = dto.toEntity();
            configRepository.save(entidad);
            log.info("Configuración de backup guardada: frecuencia={}, horas={}, activo={}",
                    dto.getFrecuencia(), dto.getHoras(), dto.isActivo());
            return BackupRespuestaDTO.ok(
                    "Configuración guardada",
                    "El schedule se actualizará en el próximo ciclo"
            );
        } catch (Exception e) {
            log.error("Error al guardar configuración de backup: {}", e.getMessage());
            return BackupRespuestaDTO.error(
                    "No se pudo guardar la configuración",
                    e.getMessage()
            );
        }
    }


    // SECCIÓN 2: HISTORIAL

    public List<BackupRegistroDTO> obtenerHistorial() {
        return registroRepository.findAllByOrderByFechaDesc()
                .stream()
                .map(BackupRegistroDTO::fromEntity)
                .toList();
    }

    // SECCIÓN 3: RETENCIÓN AUTOMÁTICA
    @Transactional
    public void aplicarRetencion() {
        configRepository.findById(1L).ifPresent(config -> {
            int retencion = config.getRetencion();
            long total    = registroRepository.count();

            // Si no se supera el límite, no hay nada que borrar
            if (total <= retencion) {
                log.info("Retención: {} backups en BD, límite es {}. Nada que borrar.",
                        total, retencion);
                return;
            }

            // Cuántos hay que eliminar
            int cantidadABorrar = (int)(total - retencion);
            log.info("Retención: {} backups en BD, límite es {}. Borrando los {} más antiguos.",
                    total, retencion, cantidadABorrar);

            // Paso 1: borrar archivos del disco (solo los que tienen archivo local)
            List<BackupRegistro> conArchivo =
                    registroRepository.findOldestWithLocalFileToDelete(cantidadABorrar);
            for (BackupRegistro backup : conArchivo) {
                borrarArchivoDisco(backup.getRutaLocal());
            }

            // Paso 2: borrar registros de la BD
            List<BackupRegistro> aEliminar =
                    registroRepository.findOldestToDelete(cantidadABorrar);
            if (!aEliminar.isEmpty()) {
                registroRepository.deleteAll(aEliminar);
                log.info("Retención aplicada: {} backups eliminados.", cantidadABorrar);
            }
        });
    }

    private void borrarArchivoDisco(String ruta) {
        try {
            Path path = Paths.get(ruta);
            if (Files.exists(path)) {
                Files.delete(path);
                log.info("Archivo de backup eliminado del disco: {}", ruta);
            } else {
                log.warn("Archivo no encontrado en disco (ya fue borrado?): {}", ruta);
            }
        } catch (IOException e) {
            log.error("No se pudo borrar el archivo {}: {}", ruta, e.getMessage());
        }
    }


    // SECCIÓN 4: EJECUCIÓN DEL BACKUP (pg_dump)
    public BackupRespuestaDTO ejecutarBackupManual(BackupRegistro.ModalidadBackup modalidad) {
        log.info("Iniciando backup MANUAL — modalidad: {}", modalidad);
        BackupRegistro registro = ejecutarBackup(BackupRegistro.TipoBackup.MANUAL, modalidad);

        if (registro.getEstado() == BackupRegistro.EstadoBackup.EXITOSO) {
            return BackupRespuestaDTO.ok(
                    "Backup " + modalidad.name().toLowerCase() + " completado",
                    "Archivo generado: " + registro.getTamano()
                            + (registro.getTablasIncluidas() != null
                            ? " — " + registro.getTablasIncluidas() + " tablas incluidas"
                            : "")
            );
        } else {
            return BackupRespuestaDTO.error(
                    "Error al ejecutar el backup",
                    registro.getError()
            );
        }
    }

    public void ejecutarBackupAutomatico() {
        BackupRegistro.ModalidadBackup modalidad = configRepository.findById(1L)
                .map(BackupConfig::getModalidadDefault)
                .orElse(BackupRegistro.ModalidadBackup.COMPLETO);
        log.info("Iniciando backup AUTOMÁTICO — modalidad: {}", modalidad);
        ejecutarBackup(BackupRegistro.TipoBackup.AUTOMATICO, modalidad);
    }

    @Transactional
    public BackupRegistro ejecutarBackup(BackupRegistro.TipoBackup tipo,
                                         BackupRegistro.ModalidadBackup modalidad) {
        // Leer la ruta desde la BD (configurable por el admin desde la UI)
        String rutaEfectiva = configRepository.findById(1L)
                .map(BackupConfig::getRutaLocalBackup)
                .filter(r -> r != null && !r.isBlank())
                .orElse(rutaLocal);

        LocalDateTime ahora        = LocalDateTime.now();
        String        prefijo       = modalidad.name().toLowerCase(); // "completo", "diferencial"...
        String        nombreArchivo = "backup_" + prefijo + "_" + ahora.format(FORMATO_FECHA) + ".sql";
        String        rutaArchivo   = rutaEfectiva + File.separator + nombreArchivo;

        BackupRegistro registro = BackupRegistro.builder()
                .fecha(ahora)
                .tipo(tipo)
                .modalidad(modalidad)
                .estado(BackupRegistro.EstadoBackup.FALLIDO)
                .build();

        try {
            // Paso 1: Crear carpeta si no existe
            crearCarpetaSiNoExiste(rutaEfectiva);

            // Paso 2: Determinar qué tablas incluir según modalidad
            List<String> tablasAIncluir = obtenerTablasParaModalidad(modalidad);
            registro.setTablasIncluidas(tablasAIncluir == null ? null : tablasAIncluir.size());
            log.info("Modalidad {}: {} tablas a incluir",
                    modalidad,
                    tablasAIncluir == null ? "TODAS" : tablasAIncluir.size());

            // Paso 3: Construir el comando pg_dump

            // Construir comando base
            java.util.List<String> comando = new java.util.ArrayList<>(java.util.Arrays.asList(
                    pgDumpPath,
                    "-h", dbHost,
                    "-p", dbPort,
                    "-U", dbUsuario,
                    "-d", dbNombre,
                    "-F", "p",
                    "-f", rutaArchivo
            ));

            // Para DIFERENCIAL e INCREMENTAL: agregar -t por cada tabla detectada
            // Si tablasAIncluir es null = COMPLETO = no se agregan filtros
            if (tablasAIncluir != null) {
                if (tablasAIncluir.isEmpty()) {
                    // No hay tablas con cambios — crear archivo vacío con comentario
                    log.info("No hay cambios detectados para modalidad {}. Backup vacío.", modalidad);
                    Files.writeString(Paths.get(rutaArchivo),
                            "-- Backup " + modalidad.name() + " generado el " + ahora
                                    + "\n-- No se detectaron cambios desde el último backup.\n");
                    registro.setEstado(BackupRegistro.EstadoBackup.EXITOSO);
                    registro.setTamano(calcularTamanoArchivo(rutaArchivo));
                    registro.setRutaLocal(rutaArchivo);
                    BackupRegistro guardado = registroRepository.save(registro);
                    aplicarRetencion();
                    return guardado;
                }
                // Agregar -t schema.tabla por cada tabla con cambios
                for (String tabla : tablasAIncluir) {
                    comando.add("-t");
                    comando.add(tabla);
                }
            }

            ProcessBuilder pb = new ProcessBuilder(comando);

            // Paso 3: Pasar la contraseña por variable de entorno

            pb.environment().put("PGPASSWORD", dbPassword);

            // Redirigir errores al mismo stream para capturarlos
            pb.redirectErrorStream(true);

            // Paso 4: Ejecutar y esperar
            log.info("Ejecutando pg_dump → {}", rutaArchivo);
            Process proceso = pb.start();

            // Capturar la salida del proceso (por si hay mensajes de error)
            String salidaProceso = new String(proceso.getInputStream().readAllBytes());

            // waitFor() bloquea el hilo hasta que pg_dump termine
            int codigoSalida = proceso.waitFor();

            // Paso 5: Verificar resultado
            if (codigoSalida == 0) {
                String tamano = calcularTamanoArchivo(rutaArchivo);
                registro.setEstado(BackupRegistro.EstadoBackup.EXITOSO);
                registro.setTamano(tamano);
                registro.setRutaLocal(rutaArchivo);
                log.info("Backup exitoso: {} ({})", nombreArchivo, tamano);
            } else {
                registro.setError("pg_dump terminó con código " + codigoSalida
                        + (salidaProceso.isBlank() ? "" : ": " + salidaProceso));
                log.error("pg_dump falló con código {}: {}", codigoSalida, salidaProceso);
            }

        } catch (IOException e) {

            String error = "No se pudo ejecutar pg_dump. " +
                    "¿Está PostgreSQL instalado y en el PATH? Error: " + e.getMessage();
            registro.setError(error);
            log.error(error);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            registro.setError("El proceso de backup fue interrumpido: " + e.getMessage());
            log.error("Backup interrumpido", e);
        }

        // Paso 6: Guardar registro en BD siempre (éxito o fallo)
        BackupRegistro guardado = registroRepository.save(registro);

        // Paso 7: Aplicar retención después de cada backup
        aplicarRetencion();

        return guardado;
    }

    private void crearCarpetaSiNoExiste(String ruta) throws IOException {
        Path path = Paths.get(ruta);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
            log.info("Carpeta de backups creada: {}", ruta);
        }
    }

    private String calcularTamanoArchivo(String ruta) {
        try {
            long bytes = Files.size(Paths.get(ruta));
            if (bytes < 1024)
                return bytes + " B";
            else if (bytes < 1024 * 1024)
                return String.format("%.1f KB", bytes / 1024.0);
            else if (bytes < 1024 * 1024 * 1024)
                return String.format("%.1f MB", bytes / (1024.0 * 1024));
            else
                return String.format("%.2f GB", bytes / (1024.0 * 1024 * 1024));
        } catch (IOException e) {
            return "desconocido";
        }
    }


    // SECCIÓN 5: DETECCIÓN DE CAMBIOS (DIFERENCIAL / INCREMENTAL)
    private List<String> obtenerTablasParaModalidad(BackupRegistro.ModalidadBackup modalidad) {
        if (modalidad == BackupRegistro.ModalidadBackup.COMPLETO) {
            return null; // null = sin filtros = dump completo
        }

        // Buscar la fecha de referencia según el tipo
        LocalDateTime fechaReferencia = obtenerFechaReferencia(modalidad);

        if (fechaReferencia == null) {
            // No hay backup previo de referencia → hacer completo como fallback seguro
            log.warn("No se encontró backup de referencia para {}. Haciendo COMPLETO como fallback.", modalidad);
            return null;
        }

        log.info("Buscando tablas modificadas desde: {}", fechaReferencia);
        return obtenerTablasModificadasDesde(fechaReferencia);
    }

    private LocalDateTime obtenerFechaReferencia(BackupRegistro.ModalidadBackup modalidad) {
        if (modalidad == BackupRegistro.ModalidadBackup.DIFERENCIAL) {
            // Buscamos el último backup COMPLETO exitoso
            return registroRepository.findAllByOrderByFechaDesc()
                    .stream()
                    .filter(b -> b.getEstado() == BackupRegistro.EstadoBackup.EXITOSO
                            && b.getModalidad() == BackupRegistro.ModalidadBackup.COMPLETO)
                    .map(BackupRegistro::getFecha)
                    .findFirst()
                    .orElse(null);
        } else {
            // INCREMENTAL → último backup exitoso de cualquier tipo
            return registroRepository.findAllByOrderByFechaDesc()
                    .stream()
                    .filter(b -> b.getEstado() == BackupRegistro.EstadoBackup.EXITOSO)
                    .map(BackupRegistro::getFecha)
                    .findFirst()
                    .orElse(null);
        }
    }

    private List<String> obtenerTablasModificadasDesde(LocalDateTime fechaReferencia) {
        String sql = """
            SELECT schemaname || '.' || relname AS tabla_completa
            FROM pg_stat_user_tables
            WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
            AND (
                n_mod_since_analyze > 0
                OR last_autoanalyze > ?
                OR last_analyze > ?
                OR last_autovacuum > ?
            )
            ORDER BY schemaname, relname
            """;

        try (java.sql.Connection conn = dataSource.getConnection();
             java.sql.PreparedStatement ps = conn.prepareStatement(sql)) {

            java.sql.Timestamp ts = java.sql.Timestamp.valueOf(fechaReferencia);
            ps.setTimestamp(1, ts);
            ps.setTimestamp(2, ts);
            ps.setTimestamp(3, ts);

            List<String> tablas = new java.util.ArrayList<>();
            try (java.sql.ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    tablas.add(rs.getString("tabla_completa"));
                }
            }

            log.info("Tablas con cambios desde {}: {}", fechaReferencia, tablas);
            return tablas;

        } catch (Exception e) {
            log.error("Error consultando pg_stat_user_tables: {}", e.getMessage());
            // Si falla la detección, hacer completo como fallback seguro
            return null;
        }
    }

    // SECCIÓN 6: DESCARGA
    public Path obtenerRutaParaDescarga(Long id) {
        return registroRepository.findById(id)
                .filter(b -> b.getRutaLocal() != null)
                .map(b -> Paths.get(b.getRutaLocal()))
                .filter(Files::exists)
                .orElse(null);
    }
}