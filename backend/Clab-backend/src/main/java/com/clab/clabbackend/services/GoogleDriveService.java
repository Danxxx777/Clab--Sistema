package com.clab.clabbackend.services;

import com.clab.clabbackend.entities.DriveConfig;
import com.clab.clabbackend.repository.DriveConfigRepository;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.api.services.drive.model.File;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleDriveService {

    private final DriveConfigRepository driveConfigRepository;

    private static final List<String> SCOPES =
            Collections.singletonList(DriveScopes.DRIVE_FILE);

    // ── Lee config desde BD en cada llamada ───────────────────────────────────
    private DriveConfig getConfig() {
        return driveConfigRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("No hay configuración de Drive en BD"));
    }

    private Credential getCredentials() throws Exception {
        DriveConfig config = getConfig();

        GoogleClientSecrets.Details details = new GoogleClientSecrets.Details();
        details.setClientId(config.getClientId());
        details.setClientSecret(config.getClientSecret());
        details.setAuthUri("https://accounts.google.com/o/oauth2/auth");
        details.setTokenUri("https://oauth2.googleapis.com/token");
        details.setRedirectUris(List.of("http://localhost:8080/oauth2/callback"));

        GoogleClientSecrets clientSecrets = new GoogleClientSecrets();
        clientSecrets.setInstalled(details);

        java.io.File tokensDir = Paths.get(config.getTokensPath()).getParent().toFile();

        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                clientSecrets,
                SCOPES)
                .setDataStoreFactory(new FileDataStoreFactory(tokensDir))
                .setAccessType("offline")
                .build();

        LocalServerReceiver receiver = new LocalServerReceiver.Builder()
                .setPort(8888)
                .build();

        return new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");
    }

    private Drive getDriveService() throws Exception {
        return new Drive.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                getCredentials())
                .setApplicationName("CLAB-Backups")
                .build();
    }

    // ── SUBIR ─────────────────────────────────────────────────────────────────
    public String subirArchivo(Path archivoPath, String nombreArchivo) throws Exception {
        Drive drive = getDriveService();
        String folderId = getConfig().getFolderId();

        File fileMetadata = new File();
        fileMetadata.setName(nombreArchivo);
        fileMetadata.setParents(Collections.singletonList(folderId));

        String mimeType = nombreArchivo.endsWith(".zip")
                ? "application/zip"
                : "application/octet-stream";

        com.google.api.client.http.FileContent mediaContent =
                new com.google.api.client.http.FileContent(mimeType, archivoPath.toFile());

        File uploaded = drive.files().create(fileMetadata, mediaContent)
                .setFields("id, name, size")
                .execute();

        log.info("Archivo subido a Drive: {} ({})", uploaded.getName(), uploaded.getId());
        return uploaded.getId();
    }

    // ── LISTAR ────────────────────────────────────────────────────────────────
    public List<File> listarArchivosBackup() throws Exception {
        Drive drive = getDriveService();
        String folderId = getConfig().getFolderId();

        return drive.files().list()
                .setQ("'" + folderId + "' in parents and trashed = false")
                .setOrderBy("createdTime asc")
                .setFields("files(id, name, createdTime, size)")
                .execute()
                .getFiles();
    }

    // ── ELIMINAR ──────────────────────────────────────────────────────────────
    public void eliminarArchivo(String fileId) throws Exception {
        Drive drive = getDriveService();
        drive.files().delete(fileId).execute();
        log.info("Archivo eliminado de Drive: {}", fileId);
    }

    // ── OBTENER URL DE AUTH ───────────────────────────────────────────────────
    public String obtenerUrlAutorizacion() throws Exception {
        DriveConfig config = getConfig();

        GoogleClientSecrets.Details details = new GoogleClientSecrets.Details();
        details.setClientId(config.getClientId());
        details.setClientSecret(config.getClientSecret());
        details.setAuthUri("https://accounts.google.com/o/oauth2/auth");
        details.setTokenUri("https://oauth2.googleapis.com/token");
        details.setRedirectUris(List.of("http://localhost:8080/oauth2/callback"));

        GoogleClientSecrets clientSecrets = new GoogleClientSecrets();
        clientSecrets.setInstalled(details);

        java.io.File tokensDir = Paths.get(config.getTokensPath()).getParent().toFile();

        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                clientSecrets,
                SCOPES)
                .setDataStoreFactory(new FileDataStoreFactory(tokensDir))
                .setAccessType("offline")
                .build();

        return flow.newAuthorizationUrl()
                .setRedirectUri("http://localhost:8080/oauth2/callback")
                .build();
    }

    // ── MANEJAR CALLBACK OAuth2 ───────────────────────────────────────────────
    public void procesarCallback(String code) throws Exception {
        DriveConfig config = getConfig();

        GoogleClientSecrets.Details details = new GoogleClientSecrets.Details();
        details.setClientId(config.getClientId());
        details.setClientSecret(config.getClientSecret());
        details.setAuthUri("https://accounts.google.com/o/oauth2/auth");
        details.setTokenUri("https://oauth2.googleapis.com/token");
        details.setRedirectUris(List.of("http://localhost:8080/oauth2/callback"));

        GoogleClientSecrets clientSecrets = new GoogleClientSecrets();
        clientSecrets.setInstalled(details);

        java.io.File tokensDir = Paths.get(config.getTokensPath()).getParent().toFile();

        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                clientSecrets,
                SCOPES)
                .setDataStoreFactory(new FileDataStoreFactory(tokensDir))
                .setAccessType("offline")
                .build();

        // Intercambiar código por tokens y guardar en disco
        flow.createAndStoreCredential(
                flow.newTokenRequest(code)
                        .setRedirectUri("http://localhost:8080/oauth2/callback")
                        .execute(),
                "user"
        );

        // Marcar como conectado en BD
        config.setConectado(true);
        config.setFechaConexion(LocalDateTime.now());
        driveConfigRepository.save(config);

        log.info("OAuth2 callback procesado — Drive conectado");
    }
}