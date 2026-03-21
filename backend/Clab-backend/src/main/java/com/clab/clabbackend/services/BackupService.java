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
    private final GoogleDriveService       googleDriveService;

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

    @Value("${backup.psql.path:psql}")
    private String psqlPath;

    @Value("${backup.pgrestore.path:pg_restore}")
    private String pgRestorePath;

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

            // ── LOCAL ──────────────────────────────────────────────

            long total = registroRepository.count();
            if (total > retencion) {
                int cantidadABorrar = (int)(total - retencion);
                log.info("Retención local: {} backups, límite {}. Borrando {} más antiguos.",
                        total, retencion, cantidadABorrar);

                List<BackupRegistro> conArchivo =
                        registroRepository.findOldestWithLocalFileToDelete(cantidadABorrar);
                for (BackupRegistro backup : conArchivo) {
                    borrarArchivoDisco(backup.getRutaLocal());
                }

                List<BackupRegistro> aEliminar =
                        registroRepository.findOldestToDelete(cantidadABorrar);
                if (!aEliminar.isEmpty()) {
                    registroRepository.deleteAll(aEliminar);
                    log.info("Retención local aplicada: {} registros eliminados.", cantidadABorrar);
                }
            } else {
                log.info("Retención local: {} backups, límite {}. Nada que borrar.", total, retencion);
            }

            // ── DRIVE ──────────────────────────────────────────────
            if (!config.isGuardarDrive()) return;

            try {
                List<com.google.api.services.drive.model.File> archivosEnDrive =
                        googleDriveService.listarArchivosBackup();

                int totalDrive = archivosEnDrive.size();
                if (totalDrive <= retencion) {
                    log.info("Retención Drive: {} archivos, límite {}. Nada que borrar.",
                            totalDrive, retencion);
                    return;
                }

                int cantidadDrive = totalDrive - retencion;
                log.info("Retención Drive: {} archivos, límite {}. Borrando {} más antiguos.",
                        totalDrive, retencion, cantidadDrive);

                // Ya vienen ordenados por createdTime asc (más antiguos primero)
                for (int i = 0; i < cantidadDrive; i++) {
                    String fileId   = archivosEnDrive.get(i).getId();
                    String fileName = archivosEnDrive.get(i).getName();
                    try {
                        googleDriveService.eliminarArchivo(fileId);
                        log.info("Archivo Drive eliminado por retención: {} ({})", fileName, fileId);
                    } catch (Exception e) {
                        log.error("No se pudo eliminar {} de Drive: {}", fileName, e.getMessage());
                    }
                }

            } catch (Exception e) {
                log.error("Error al aplicar retención en Drive: {}", e.getMessage());
                // No interrumpe el flujo principal
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
    public BackupRespuestaDTO ejecutarBackupManual(
            BackupRegistro.ModalidadBackup modalidad, String formato) {
        log.info("Iniciando backup MANUAL — modalidad: {}, formato: {}", modalidad, formato);
        BackupRegistro registro = ejecutarBackup(
                BackupRegistro.TipoBackup.MANUAL, modalidad, formato);

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
        // El backup automático siempre usa formato SQL por compatibilidad
        log.info("Iniciando backup AUTOMÁTICO — modalidad: {}", modalidad);
        ejecutarBackup(BackupRegistro.TipoBackup.AUTOMATICO, modalidad, "SQL");
    }

    @Transactional
    public BackupRegistro ejecutarBackup(BackupRegistro.TipoBackup tipo,
                                         BackupRegistro.ModalidadBackup modalidad,
                                         String formato) {
        // Determinar si es formato custom o plain
        boolean esCustom = "CUSTOM".equalsIgnoreCase(formato);
        String extension = esCustom ? ".backup" : ".sql";

        // Leer la ruta desde la BD (configurable por el admin desde la UI)
        String rutaEfectiva = configRepository.findById(1L)
                .map(BackupConfig::getRutaLocalBackup)
                .filter(r -> r != null && !r.isBlank())
                .orElse(rutaLocal);

        LocalDateTime ahora        = LocalDateTime.now();
        String        prefijo       = modalidad.name().toLowerCase();
        String        nombreArchivo = "backup_" + prefijo + "_" + ahora.format(FORMATO_FECHA) + extension;
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
            java.util.List<String> comando = new java.util.ArrayList<>(java.util.Arrays.asList(
                    pgDumpPath,
                    "-h", dbHost,
                    "-p", dbPort,
                    "-U", dbUsuario,
                    "-d", dbNombre
            ));

            // Formato y opciones según tipo
            if (esCustom) {
                // Formato custom: binario, incluye estructura completa, restaurable desde 0
                comando.add("-F");
                comando.add("c");
            } else {
                // Formato plain: SQL legible, con INSERTs
                comando.add("-F");
                comando.add("p");
                comando.add("--inserts");
                comando.add("--on-conflict-do-nothing");
            }

            // Excluir siempre las tablas de sistema de backup
            comando.add("--exclude-table");
            comando.add("configuracion.backup_registro");
            comando.add("--exclude-table");
            comando.add("configuracion.backup_config");

            comando.add("-f");
            comando.add(rutaArchivo);

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

                    // Subir a Drive si está habilitado en la config
                    subirADriveSiCorresponde(registro, Paths.get(rutaArchivo), nombreArchivo);

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

            // Pasar la contraseña por variable de entorno
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

                // Subir a Drive si está habilitado en la config
                subirADriveSiCorresponde(registro, Paths.get(rutaArchivo), nombreArchivo);

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

    // Sube el archivo a Google Drive si guardarDrive=true en la config.
    // Si Drive falla, solo se loguea — no interrumpe el backup principal.
    private void subirADriveSiCorresponde(BackupRegistro registro, Path rutaPath, String nombreArchivo) {
        try {
            boolean guardarDrive = configRepository.findById(1L)
                    .map(BackupConfig::isGuardarDrive)
                    .orElse(false);

            if (guardarDrive) {
                log.info("Subiendo backup a Google Drive: {}", nombreArchivo);
                String driveId = googleDriveService.subirArchivo(rutaPath, nombreArchivo);
                registro.setDriveFileId(driveId);
                log.info("Backup subido a Drive con ID: {}", driveId);
            }
        } catch (Exception e) {
            log.error("No se pudo subir el backup a Google Drive: {}", e.getMessage());
        }
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

    // SECCIÓN 7: RESTAURACIÓN
    public BackupRespuestaDTO restaurarBackup(Long id) {
        return registroRepository.findById(id)
                .map(registro -> {
                    if (registro.getRutaLocal() == null) {
                        return BackupRespuestaDTO.error(
                                "Sin archivo local",
                                "Este backup no tiene archivo local disponible para restaurar"
                        );
                    }
                    return ejecutarRestauracion(Paths.get(registro.getRutaLocal()));
                })
                .orElse(BackupRespuestaDTO.error("No encontrado", "No existe un backup con ese ID"));
    }

    public BackupRespuestaDTO restaurarDesdeArchivo(
            org.springframework.web.multipart.MultipartFile archivo) {
        try {
            // Guardar el archivo subido en una carpeta temporal
            Path temp = Files.createTempFile("restore_", "_" + archivo.getOriginalFilename());
            archivo.transferTo(temp.toFile());
            BackupRespuestaDTO resultado = ejecutarRestauracion(temp);
            // Borrar el temporal después
            Files.deleteIfExists(temp);
            return resultado;
        } catch (IOException e) {
            log.error("Error al guardar archivo temporal para restauración: {}", e.getMessage());
            return BackupRespuestaDTO.error("Error al procesar archivo", e.getMessage());
        }
    }

    private BackupRespuestaDTO ejecutarRestauracion(Path rutaArchivo) {
        try {
            log.info("Iniciando restauración desde: {}", rutaArchivo);

            // Detectar formato por extensión
            boolean esCustom = rutaArchivo.toString().endsWith(".backup");

            // Guardar registros actuales de backup antes de restaurar
            List<BackupRegistro> registrosActuales = new java.util.ArrayList<>();
            try (java.sql.Connection conn = dataSource.getConnection();
                 java.sql.Statement stmt = conn.createStatement()) {

                // Guardar registros en memoria antes de truncar
                try (java.sql.ResultSet rs = stmt.executeQuery(
                        "SELECT * FROM configuracion.backup_registro ORDER BY id")) {
                    while (rs.next()) {
                        registrosActuales.add(BackupRegistro.builder()
                                .id(rs.getLong("id"))
                                .fecha(rs.getTimestamp("fecha").toLocalDateTime())
                                .tipo(BackupRegistro.TipoBackup.valueOf(rs.getString("tipo")))
                                .modalidad(BackupRegistro.ModalidadBackup.valueOf(rs.getString("modalidad")))
                                .estado(BackupRegistro.EstadoBackup.valueOf(rs.getString("estado")))
                                .tamano(rs.getString("tamano"))
                                .rutaLocal(rs.getString("ruta_local"))
                                .driveFileId(rs.getString("drive_file_id"))
                                .error(rs.getString("error"))
                                .build());
                    }
                }

                // Limpiar tablas del sistema para evitar conflictos de PK
                stmt.execute("TRUNCATE configuracion.backup_registro RESTART IDENTITY CASCADE");
                stmt.execute("TRUNCATE configuracion.backup_config RESTART IDENTITY CASCADE");
                log.info("Tablas de sistema limpiadas antes de restaurar ({} registros guardados)",
                        registrosActuales.size());
            } catch (Exception e) {
                log.warn("No se pudo limpiar tablas de sistema: {}", e.getMessage());
            }

            // Construir comando según formato
            java.util.List<String> comando;
            if (esCustom) {
                comando = new java.util.ArrayList<>(java.util.Arrays.asList(
                        pgRestorePath,
                        "-h", dbHost,
                        "-p", dbPort,
                        "-U", dbUsuario,
                        "-d", dbNombre,
                        "--clean",
                        "--if-exists",
                        "--no-owner",
                        "--no-privileges",
                        "--disable-triggers",
                        "-v",
                        rutaArchivo.toString()
                ));
            }else {
                // psql para formato plain SQL
                comando = new java.util.ArrayList<>(java.util.Arrays.asList(
                        psqlPath,
                        "-h", dbHost,
                        "-p", dbPort,
                        "-U", dbUsuario,
                        "-d", dbNombre,
                        "-f", rutaArchivo.toString()
                ));
            }

            ProcessBuilder pb = new ProcessBuilder(comando);
            pb.environment().put("PGPASSWORD", dbPassword);
            pb.redirectErrorStream(true);

            Process proceso = pb.start();
            String salida = new String(proceso.getInputStream().readAllBytes());
            int codigo = proceso.waitFor();

            if (codigo == 0 || codigo == 1) {
                log.info("Restauración exitosa desde: {}", rutaArchivo);

                // Restaurar registros de backup después del restore
                if (!registrosActuales.isEmpty()) {
                    try {
                        registroRepository.saveAll(registrosActuales);
                        log.info("Registros de backup reinsertados: {}", registrosActuales.size());
                    } catch (Exception e) {
                        log.warn("No se pudieron reinsertar registros de backup: {}", e.getMessage());
                    }
                }

                return BackupRespuestaDTO.ok(
                        "Restauración completada",
                        "La base de datos fue restaurada correctamente"
                );
            } else {
                log.error("Restauración terminó con código {}: {}", codigo, salida);

                // Aunque falló el restore, reinsertar los registros de backup
                if (!registrosActuales.isEmpty()) {
                    try {
                        registroRepository.saveAll(registrosActuales);
                    } catch (Exception e) {
                        log.warn("No se pudieron reinsertar registros de backup tras fallo: {}", e.getMessage());
                    }
                }

                return BackupRespuestaDTO.error(
                        "Error en la restauración",
                        "Terminó con código " + codigo + (salida.isBlank() ? "" : ": " + salida)
                );
            }
        } catch (IOException e) {
            log.error("No se pudo ejecutar la restauración: {}", e.getMessage());
            return BackupRespuestaDTO.error(
                    "No se pudo ejecutar la restauración",
                    "¿Está PostgreSQL en el PATH? " + e.getMessage()
            );
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return BackupRespuestaDTO.error("Restauración interrumpida", e.getMessage());
        }
    }
}