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

    private final BackupRegistroRepository registroRepository;
    private final BackupConfigRepository   configRepository;
    private final DataSource               dataSource;
    private final GoogleDriveService       googleDriveService;

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

    private static final DateTimeFormatter FORMATO_FECHA =
            DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss");

    private static final String[] ROLES_CLAB = {
            "clab_decano", "clab_administrador", "clab_coordinador",
            "clab_docente", "clab_encargado_lab", "clab_test"
    };

    // =========================================================
    // SECCIÓN 1: CONFIGURACIÓN
    // =========================================================

    public BackupConfigDTO obtenerConfiguracion() {
        return configRepository.findById(1L)
                .map(BackupConfigDTO::fromEntity)
                .orElseGet(() -> {
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
            return BackupRespuestaDTO.error("No se pudo guardar la configuración", e.getMessage());
        }
    }

    // =========================================================
    // SECCIÓN 2: HISTORIAL
    // =========================================================

    public List<BackupRegistroDTO> obtenerHistorial() {
        return registroRepository.findAllByOrderByFechaDesc()
                .stream()
                .map(BackupRegistroDTO::fromEntity)
                .toList();
    }

    // =========================================================
    // SECCIÓN 3: RETENCIÓN AUTOMÁTICA
    // =========================================================

    @Transactional
    public void aplicarRetencion() {
        configRepository.findById(1L).ifPresent(config -> {
            int retencion = config.getRetencion();

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

    // =========================================================
    // SECCIÓN 4: EJECUCIÓN DEL BACKUP (pg_dump)
    // =========================================================

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
            return BackupRespuestaDTO.error("Error al ejecutar el backup", registro.getError());
        }
    }

    public void ejecutarBackupAutomatico() {
        BackupRegistro.ModalidadBackup modalidad = configRepository.findById(1L)
                .map(BackupConfig::getModalidadDefault)
                .orElse(BackupRegistro.ModalidadBackup.COMPLETO);
        log.info("Iniciando backup AUTOMÁTICO — modalidad: {}", modalidad);
        ejecutarBackup(BackupRegistro.TipoBackup.AUTOMATICO, modalidad, "SQL");
    }

    @Transactional
    public BackupRegistro ejecutarBackup(BackupRegistro.TipoBackup tipo,
                                         BackupRegistro.ModalidadBackup modalidad,
                                         String formato) {
        boolean esCustom  = "CUSTOM".equalsIgnoreCase(formato);
        String  extension = esCustom ? ".backup" : ".sql";

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
            crearCarpetaSiNoExiste(rutaEfectiva);

            List<String> tablasAIncluir = obtenerTablasParaModalidad(modalidad);
            registro.setTablasIncluidas(tablasAIncluir == null ? null : tablasAIncluir.size());
            log.info("Modalidad {}: {} tablas a incluir",
                    modalidad, tablasAIncluir == null ? "TODAS" : tablasAIncluir.size());

            java.util.List<String> comando = new java.util.ArrayList<>(java.util.Arrays.asList(
                    pgDumpPath, "-h", dbHost, "-p", dbPort, "-U", dbUsuario, "-d", dbNombre
            ));

            if (esCustom) {
                comando.add("-F"); comando.add("c");
            } else {
                comando.add("-F"); comando.add("p");
                comando.add("--inserts");
                comando.add("--on-conflict-do-nothing");
            }

            comando.add("--exclude-table-data"); comando.add("configuracion.backup_registro");
            comando.add("--exclude-table-data"); comando.add("configuracion.backup_config");
            comando.add("-f"); comando.add(rutaArchivo);

            if (tablasAIncluir != null) {
                if (tablasAIncluir.isEmpty()) {
                    log.info("No hay cambios detectados para modalidad {}. Backup vacío.", modalidad);
                    Files.writeString(Paths.get(rutaArchivo),
                            "-- Backup " + modalidad.name() + " generado el " + ahora
                                    + "\n-- No se detectaron cambios desde el último backup.\n");
                    registro.setEstado(BackupRegistro.EstadoBackup.EXITOSO);
                    registro.setTamano(calcularTamanoArchivo(rutaArchivo));
                    registro.setRutaLocal(rutaArchivo);
                    subirADriveSiCorresponde(registro, Paths.get(rutaArchivo), nombreArchivo);
                    BackupRegistro guardado = registroRepository.save(registro);
                    aplicarRetencion();
                    return guardado;
                }
                for (String tabla : tablasAIncluir) {
                    comando.add("-t"); comando.add(tabla);
                }
            }

            ProcessBuilder pb = new ProcessBuilder(comando);
            pb.environment().put("PGPASSWORD", dbPassword);
            pb.redirectErrorStream(true);

            log.info("Ejecutando pg_dump → {}", rutaArchivo);
            Process proceso      = pb.start();
            String salidaProceso = new String(proceso.getInputStream().readAllBytes());
            int    codigoSalida  = proceso.waitFor();

            if (codigoSalida == 0) {
                if (esCustom) {
                    try {
                        Path   zipPath   = empaquetarEnZip(rutaArchivo, nombreArchivo, modalidad.name(), ahora);
                        String rutaZip   = zipPath.toString();
                        String nombreZip = zipPath.getFileName().toString();
                        String tamano    = calcularTamanoArchivo(rutaZip);

                        registro.setEstado(BackupRegistro.EstadoBackup.EXITOSO);
                        registro.setTamano(tamano);
                        registro.setRutaLocal(rutaZip);
                        log.info("Backup CUSTOM empaquetado en ZIP: {} ({})", nombreZip, tamano);
                        subirADriveSiCorresponde(registro, zipPath, nombreZip);
                    } catch (IOException e) {
                        log.error("No se pudo empaquetar en ZIP, guardando .backup original: {}", e.getMessage());
                        String tamano = calcularTamanoArchivo(rutaArchivo);
                        registro.setEstado(BackupRegistro.EstadoBackup.EXITOSO);
                        registro.setTamano(tamano);
                        registro.setRutaLocal(rutaArchivo);
                        subirADriveSiCorresponde(registro, Paths.get(rutaArchivo), nombreArchivo);
                    }
                } else {
                    String tamano = calcularTamanoArchivo(rutaArchivo);
                    registro.setEstado(BackupRegistro.EstadoBackup.EXITOSO);
                    registro.setTamano(tamano);
                    registro.setRutaLocal(rutaArchivo);
                    log.info("Backup SQL exitoso: {} ({})", nombreArchivo, tamano);
                    subirADriveSiCorresponde(registro, Paths.get(rutaArchivo), nombreArchivo);
                }
            } else {
                registro.setError("pg_dump terminó con código " + codigoSalida
                        + (salidaProceso.isBlank() ? "" : ": " + salidaProceso));
                log.error("pg_dump falló con código {}: {}", codigoSalida, salidaProceso);
            }

        } catch (IOException e) {
            String error = "No se pudo ejecutar pg_dump. ¿Está PostgreSQL instalado y en el PATH? Error: "
                    + e.getMessage();
            registro.setError(error);
            log.error(error);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            registro.setError("El proceso de backup fue interrumpido: " + e.getMessage());
            log.error("Backup interrumpido", e);
        }

        BackupRegistro guardado = registroRepository.save(registro);
        aplicarRetencion();
        return guardado;
    }

    // =========================================================
    // SECCIÓN 5: EMPAQUETADO ZIP (solo CUSTOM)
    // =========================================================

    private Path empaquetarEnZip(String rutaArchivo, String nombreArchivo,
                                 String modalidad, LocalDateTime fecha) throws IOException {
        String nombreZip  = nombreArchivo.replace(".backup", ".zip");
        String rutaZip    = rutaArchivo.replace(".backup", ".zip");
        Path   pathZip    = Paths.get(rutaZip);
        Path   pathBackup = Paths.get(rutaArchivo);

        String instrucciones = """
=======================================================
  GUÍA DE RESTAURACIÓN — CLAB Sistema
=======================================================

Backup:    %s
Modalidad: %s
Generado:  %s

-------------------------------------------------------
PASO 1 — Instalar PostgreSQL (si no está instalado)
-------------------------------------------------------
Descarga PostgreSQL desde: https://www.postgresql.org/download/
Durante la instalación define una contraseña para "postgres".

-------------------------------------------------------
PASO 2 — Abrir pgAdmin y crear la base de datos
-------------------------------------------------------
1. Abre pgAdmin
2. Clic derecho en "Databases" → Create → Database
3. En "Database" escribe:  CLAB
4. En "Owner" selecciona:  postgres
5. Clic en "Save"

-------------------------------------------------------
PASO 3 — Restaurar el backup
-------------------------------------------------------
1. Clic derecho en la BD "CLAB" → Restore...
2. En "Filename" haz clic en el ícono de carpeta
   y selecciona el archivo:  %s
3. En la pestaña "Role name" escribe:  postgres
4. Clic en "Restore"
5. Cuando termine verás "Process returned exit code 0"
   (algunos warnings en amarillo son normales)

-------------------------------------------------------
PASO 4 — Iniciar la aplicación CLAB
-------------------------------------------------------
Ejecuta el backend:
  java -jar clab-backend.jar

Luego abre el navegador en:
  http://localhost:4200

Ingresa con tus credenciales reales.

=======================================================
  Generado automáticamente por CLAB Sistema v1.0
  %s
=======================================================
""".formatted(
                nombreArchivo,
                modalidad,
                fecha.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")),
                nombreArchivo,
                fecha.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"))
        );

        try (java.util.zip.ZipOutputStream zos =
                     new java.util.zip.ZipOutputStream(Files.newOutputStream(pathZip))) {
            zos.putNextEntry(new java.util.zip.ZipEntry(nombreArchivo));
            Files.copy(pathBackup, zos);
            zos.closeEntry();

            zos.putNextEntry(new java.util.zip.ZipEntry("INSTRUCCIONES.txt"));
            zos.write(instrucciones.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            zos.closeEntry();
        }

        Files.deleteIfExists(pathBackup);
        log.info("Backup empaquetado en ZIP con instrucciones: {}", rutaZip);
        return pathZip;
    }

    // =========================================================
    // SECCIÓN 6: SUBIDA A DRIVE
    // =========================================================

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

    // =========================================================
    // SECCIÓN 7: HELPERS
    // =========================================================

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

    // =========================================================
    // SECCIÓN 8: DETECCIÓN DE CAMBIOS (DIFERENCIAL / INCREMENTAL)
    // =========================================================

    private List<String> obtenerTablasParaModalidad(BackupRegistro.ModalidadBackup modalidad) {
        if (modalidad == BackupRegistro.ModalidadBackup.COMPLETO) {
            return null;
        }

        LocalDateTime fechaReferencia = obtenerFechaReferencia(modalidad);

        if (fechaReferencia == null) {
            log.warn("No se encontró backup de referencia para {}. Haciendo COMPLETO como fallback.", modalidad);
            return null;
        }

        log.info("Buscando tablas modificadas desde: {}", fechaReferencia);
        return obtenerTablasModificadasDesde(fechaReferencia);
    }

    private LocalDateTime obtenerFechaReferencia(BackupRegistro.ModalidadBackup modalidad) {
        if (modalidad == BackupRegistro.ModalidadBackup.DIFERENCIAL) {
            return registroRepository.findAllByOrderByFechaDesc()
                    .stream()
                    .filter(b -> b.getEstado() == BackupRegistro.EstadoBackup.EXITOSO
                            && b.getModalidad() == BackupRegistro.ModalidadBackup.COMPLETO)
                    .map(BackupRegistro::getFecha)
                    .findFirst()
                    .orElse(null);
        } else {
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
            return null;
        }
    }

    // =========================================================
    // SECCIÓN 9: DESCARGA
    // =========================================================

    public Path obtenerRutaParaDescarga(Long id) {
        return registroRepository.findById(id)
                .filter(b -> b.getRutaLocal() != null)
                .map(b -> Paths.get(b.getRutaLocal()))
                .filter(Files::exists)
                .orElse(null);
    }

    // =========================================================
    // SECCIÓN 10: RESTAURACIÓN
    // =========================================================

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
            Path temp = Files.createTempFile("restore_", "_" + archivo.getOriginalFilename());
            archivo.transferTo(temp.toFile());
            BackupRespuestaDTO resultado = ejecutarRestauracion(temp);
            Files.deleteIfExists(temp);
            return resultado;
        } catch (IOException e) {
            log.error("Error al guardar archivo temporal para restauración: {}", e.getMessage());
            return BackupRespuestaDTO.error("Error al procesar archivo", e.getMessage());
        }
    }

    private BackupRespuestaDTO ejecutarRestauracion(Path rutaArchivo) {
        Path tempDir     = null;
        Path archivoReal = rutaArchivo;

        try {
            log.info("Iniciando restauración desde: {}", rutaArchivo);

            // Si es ZIP, extraer el .backup antes de restaurar
            if (rutaArchivo.toString().endsWith(".zip")) {
                tempDir     = Files.createTempDirectory("clab_restore_");
                archivoReal = extraerBackupDeZip(rutaArchivo, tempDir);
                log.info("Backup extraído del ZIP: {}", archivoReal);
            }

            boolean esCustom = archivoReal.toString().endsWith(".backup");

            // ── PASO 1: Terminar conexiones activas ──────────────────────────
            ProcessBuilder pbKill = new ProcessBuilder(
                    psqlPath, "-h", dbHost, "-p", dbPort, "-U", dbUsuario, "-d", "postgres",
                    "-c", "SELECT pg_terminate_backend(pid) FROM pg_stat_activity " +
                    "WHERE datname = '" + dbNombre + "' AND pid <> pg_backend_pid()"
            );
            pbKill.environment().put("PGPASSWORD", dbPassword);
            pbKill.redirectErrorStream(true);
            pbKill.start().waitFor();
            log.info("Conexiones a {} terminadas", dbNombre);

            // ── PASO 2: DROP y CREATE de la BD ───────────────────────────────
            try {
                ProcessBuilder pbDrop = new ProcessBuilder(
                        psqlPath, "-h", dbHost, "-p", dbPort, "-U", dbUsuario, "-d", "postgres",
                        "-c", "DROP DATABASE IF EXISTS \"" + dbNombre + "\""
                );
                pbDrop.environment().put("PGPASSWORD", dbPassword);
                pbDrop.redirectErrorStream(true);
                Process dropProc = pbDrop.start();
                String dropSalida = new String(dropProc.getInputStream().readAllBytes());
                dropProc.waitFor();
                log.info("DROP DATABASE ejecutado: {}", dropSalida);

                ProcessBuilder pbCreate = new ProcessBuilder(
                        psqlPath, "-h", dbHost, "-p", dbPort, "-U", dbUsuario, "-d", "postgres",
                        "-c", "CREATE DATABASE \"" + dbNombre + "\""
                );
                pbCreate.environment().put("PGPASSWORD", dbPassword);
                pbCreate.redirectErrorStream(true);
                Process createProc = pbCreate.start();
                String createSalida = new String(createProc.getInputStream().readAllBytes());
                createProc.waitFor();
                log.info("CREATE DATABASE ejecutado: {}", createSalida);
            } catch (Exception e) {
                log.warn("No se pudo recrear la BD: {}", e.getMessage());
            }

            // ── PASO 3: Crear roles de BD antes del restore ──────────────────
            for (String rol : ROLES_CLAB) {
                try {
                    ProcessBuilder pbRol = new ProcessBuilder(
                            psqlPath, "-h", dbHost, "-p", dbPort, "-U", dbUsuario, "-d", "postgres",
                            "-c", "DO $$ BEGIN " +
                            "CREATE ROLE \"" + rol + "\" WITH NOLOGIN; " +
                            "EXCEPTION WHEN duplicate_object THEN NULL; " +
                            "END $$;"
                    );
                    pbRol.environment().put("PGPASSWORD", dbPassword);
                    pbRol.redirectErrorStream(true);
                    pbRol.start().waitFor();
                    log.info("Rol BD creado (o ya existía): {}", rol);
                } catch (Exception e) {
                    log.warn("No se pudo crear rol {}: {}", rol, e.getMessage());
                }
            }

            if (esCustom) {
                // ── PASO 4a: Restaurar estructura y funciones ─────────────────
                // --section=pre-data : schemas, tablas, secuencias, funciones
                // --section=post-data: constraints, triggers, índices
                log.info("Restaurando estructura y funciones (pre-data + post-data)...");
                java.util.List<String> comandoEstructura = new java.util.ArrayList<>(
                        java.util.Arrays.asList(
                                pgRestorePath,
                                "-h", dbHost, "-p", dbPort, "-U", dbUsuario, "-d", dbNombre,
                                "--section=pre-data",
                                "--section=post-data",
                                "-v",
                                archivoReal.toString()
                        )
                );
                ProcessBuilder pbEstructura = new ProcessBuilder(comandoEstructura);
                pbEstructura.environment().put("PGPASSWORD", dbPassword);
                pbEstructura.redirectErrorStream(true);
                Process procEstructura = pbEstructura.start();
                String salidaEstructura = new String(procEstructura.getInputStream().readAllBytes());
                int codigoEstructura = procEstructura.waitFor();
                log.info("Estructura restaurada (código {})", codigoEstructura);
                if (!salidaEstructura.isBlank()) {
                    log.debug("Salida estructura: {}", salidaEstructura);
                }

                // ── PASO 4b: Restaurar solo datos ignorando FKs ───────────────
                // --section=data      : solo los COPY/INSERT de datos
                // --disable-triggers  : desactiva triggers temporalmente para
                //                       evitar errores de FK por orden de inserción
                log.info("Restaurando datos (--section=data --disable-triggers)...");
                java.util.List<String> comandoDatos = new java.util.ArrayList<>(
                        java.util.Arrays.asList(
                                pgRestorePath,
                                "-h", dbHost, "-p", dbPort, "-U", dbUsuario, "-d", dbNombre,
                                "--section=data",
                                "--disable-triggers",
                                "-v",
                                archivoReal.toString()
                        )
                );
                ProcessBuilder pbDatos = new ProcessBuilder(comandoDatos);
                pbDatos.environment().put("PGPASSWORD", dbPassword);
                pbDatos.redirectErrorStream(true);
                Process procDatos = pbDatos.start();
                String salidaDatos = new String(procDatos.getInputStream().readAllBytes());
                int codigoDatos = procDatos.waitFor();
                log.info("Datos restaurados (código {})", codigoDatos);
                if (!salidaDatos.isBlank()) {
                    log.debug("Salida datos: {}", salidaDatos);
                }

                if ((codigoEstructura != 0 && codigoEstructura != 1) ||
                        (codigoDatos != 0 && codigoDatos != 1)) {
                    log.error("Restauración falló — estructura: {}, datos: {}",
                            codigoEstructura, codigoDatos);
                    return BackupRespuestaDTO.error(
                            "Error en la restauración",
                            "Estructura: código " + codigoEstructura +
                                    " | Datos: código " + codigoDatos
                    );
                }

            } else {
                // ── Para archivos SQL planos ───────────────────────────────────
                java.util.List<String> comando = new java.util.ArrayList<>(java.util.Arrays.asList(
                        psqlPath,
                        "-h", dbHost, "-p", dbPort, "-U", dbUsuario, "-d", dbNombre,
                        "-f", archivoReal.toString()
                ));
                ProcessBuilder pb = new ProcessBuilder(comando);
                pb.environment().put("PGPASSWORD", dbPassword);
                pb.redirectErrorStream(true);
                Process proceso = pb.start();
                String salida = new String(proceso.getInputStream().readAllBytes());
                int codigo = proceso.waitFor();
                log.info("psql terminó con código: {}", codigo);

                if (codigo != 0 && codigo != 1) {
                    log.error("Restauración SQL falló con código {}: {}", codigo, salida);
                    return BackupRespuestaDTO.error(
                            "Error en la restauración",
                            "Terminó con código " + codigo + (salida.isBlank() ? "" : ": " + salida)
                    );
                }
            }

            // ── PASO 5: Re-aplicar GRANTs esenciales ─────────────────────────
            log.info("Aplicando GRANTs esenciales a los roles clab_*...");
            aplicarGrantsEsenciales();

            log.info("Restauración completada exitosamente");
            return BackupRespuestaDTO.ok(
                    "Restauración completada",
                    "La base de datos fue restaurada correctamente"
            );

        } catch (IOException e) {
            log.error("No se pudo ejecutar la restauración: {}", e.getMessage());
            return BackupRespuestaDTO.error(
                    "No se pudo ejecutar la restauración",
                    "¿Está PostgreSQL en el PATH? " + e.getMessage()
            );
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return BackupRespuestaDTO.error("Restauración interrumpida", e.getMessage());
        } finally {
            if (tempDir != null) {
                try {
                    Files.walk(tempDir)
                            .sorted(java.util.Comparator.reverseOrder())
                            .forEach(p -> {
                                try { Files.delete(p); } catch (IOException ignored) {}
                            });
                } catch (IOException ignored) {}
            }
        }
    }

    // =========================================================
    // SECCIÓN 11: GRANTS ESENCIALES
    // =========================================================

    private void aplicarGrantsEsenciales() {
        String[][] grantSchemas = {
                {"clab_decano",        "academico"},
                {"clab_administrador", "academico"},
                {"clab_coordinador",   "academico"},
                {"clab_administrador", "configuracion"},
                {"clab_decano",        "configuracion"},
                {"clab_decano",        "inventario"},
                {"clab_administrador", "inventario"},
                {"clab_docente",       "inventario"},
                {"clab_encargado_lab", "inventario"},
                {"clab_decano",        "laboratorios"},
                {"clab_administrador", "laboratorios"},
                {"clab_encargado_lab", "laboratorios"},
                {"clab_decano",        "notificaciones"},
                {"clab_administrador", "notificaciones"},
                {"clab_docente",       "notificaciones"},
                {"clab_encargado_lab", "notificaciones"},
                {"clab_coordinador",   "notificaciones"},
                {"clab_administrador", "organizacion"},
                {"clab_administrador", "public"},
                {"clab_administrador", "recursos"},
                {"clab_decano",        "reportes"},
                {"clab_administrador", "reportes"},
                {"clab_docente",       "reportes"},
                {"clab_encargado_lab", "reportes"},
                {"clab_decano",        "reservas"},
                {"clab_administrador", "reservas"},
                {"clab_docente",       "reservas"},
                {"clab_encargado_lab", "reservas"},
                {"clab_coordinador",   "reservas"},
                {"clab_administrador", "seguridad"},
                {"clab_administrador", "seguridad_bd"},
                {"clab_decano",        "usuarios"},
                {"clab_administrador", "usuarios"},
                {"clab_test",          "usuarios"},
                {"clab_coordinador",   "usuarios"},
        };

        for (String[] entry : grantSchemas) {
            ejecutarSql(String.format("GRANT USAGE ON SCHEMA %s TO %s", entry[1], entry[0]));
        }

        String[] schemas = {
                "academico", "configuracion", "inventario", "laboratorios",
                "notificaciones", "organizacion", "public", "recursos",
                "reportes", "reservas", "seguridad", "seguridad_bd", "usuarios"
        };
        for (String schema : schemas) {
            for (String rol : ROLES_CLAB) {
                ejecutarSql(String.format(
                        "GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA %s TO %s", schema, rol));
                ejecutarSql(String.format(
                        "GRANT EXECUTE ON ALL PROCEDURES IN SCHEMA %s TO %s", schema, rol));
            }
        }

        log.info("GRANTs esenciales aplicados correctamente");
    }

    private void ejecutarSql(String sql) {
        try {
            ProcessBuilder pb = new ProcessBuilder(
                    psqlPath, "-h", dbHost, "-p", dbPort, "-U", dbUsuario, "-d", dbNombre,
                    "-c", sql
            );
            pb.environment().put("PGPASSWORD", dbPassword);
            pb.redirectErrorStream(true);
            Process proc = pb.start();
            String salida = new String(proc.getInputStream().readAllBytes());
            int codigo = proc.waitFor();
            if (codigo != 0 && !salida.contains("does not exist")) {
                log.warn("SQL terminó con código {}: {} → {}", codigo, sql, salida.trim());
            }
        } catch (Exception e) {
            log.warn("No se pudo ejecutar SQL: {} → {}", sql, e.getMessage());
        }
    }

    // =========================================================
    // SECCIÓN 12: EXTRACCIÓN DE ZIP
    // =========================================================

    private Path extraerBackupDeZip(Path zipPath, Path destDir) throws IOException {
        try (java.util.zip.ZipInputStream zis =
                     new java.util.zip.ZipInputStream(Files.newInputStream(zipPath))) {
            java.util.zip.ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (entry.getName().endsWith(".backup")) {
                    Path destFile = destDir.resolve(entry.getName());
                    Files.copy(zis, destFile);
                    log.info("Archivo .backup extraído del ZIP: {}", destFile);
                    return destFile;
                }
                zis.closeEntry();
            }
        }
        throw new IOException("No se encontró archivo .backup dentro del ZIP: " + zipPath);
    }
}