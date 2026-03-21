package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "c_drive_config", schema = "configuracion")
public class DriveConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_id")
    private String clientId;

    @Column(name = "client_secret")
    private String clientSecret;

    @Column(name = "folder_id")
    private String folderId;

    @Column(name = "folder_nombre")
    private String folderNombre;

    @Column(name = "tokens_path")
    private String tokensPath;

    @Column(name = "conectado")
    private boolean conectado;

    @Column(name = "email_cuenta")
    private String emailCuenta;

    @Column(name = "fecha_conexion")
    private LocalDateTime fechaConexion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}