package com.clab.clabbackend.services;

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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
public class GoogleDriveService {

    @Value("${google.oauth2.client-id}")
    private String clientId;

    @Value("${google.oauth2.client-secret}")
    private String clientSecret;

    @Value("${google.oauth2.tokens-file}")
    private String tokensFile;

    @Value("${google.drive.folder-id}")
    private String folderId;

    private static final List<String> SCOPES =
            Collections.singletonList(DriveScopes.DRIVE_FILE);

    private Credential getCredentials() throws Exception {
        // Construir el objeto de secretos del cliente manualmente
        GoogleClientSecrets.Details details = new GoogleClientSecrets.Details();
        details.setClientId(clientId);
        details.setClientSecret(clientSecret);
        details.setAuthUri("https://accounts.google.com/o/oauth2/auth");
        details.setTokenUri("https://oauth2.googleapis.com/token");
        details.setRedirectUris(List.of("http://localhost:8080/oauth2/callback"));

        GoogleClientSecrets clientSecrets = new GoogleClientSecrets();
        clientSecrets.setInstalled(details);

        // Carpeta donde se guardan los tokens
        java.io.File tokensDir = Paths.get(tokensFile).getParent().toFile();

        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                clientSecrets,
                SCOPES)
                .setDataStoreFactory(new FileDataStoreFactory(tokensDir))
                .setAccessType("offline")
                .build();

        // LocalServerReceiver abre el navegador automáticamente la primera vez
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

    public String subirArchivo(Path archivoPath, String nombreArchivo) throws Exception {
        Drive drive = getDriveService();

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
}