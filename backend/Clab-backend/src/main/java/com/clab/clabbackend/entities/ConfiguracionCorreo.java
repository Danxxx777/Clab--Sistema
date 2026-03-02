package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "configuracion_correo", schema = "usuarios")
public class ConfiguracionCorreo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_config")
    private Integer idConfig;

    @Column(name = "nombre_display", length = 100)
    private String nombreDisplay; // 👈 "Correo de recuperación"

    @Column(name = "proposito", length = 50)
    private String proposito; // 👈 GENERAL, RECUPERACION, NOTIFICACIONES, RESERVAS, REPORTES

    @Column(name = "host", length = 100, nullable = false)
    private String host;

    @Column(name = "puerto", nullable = false)
    private Integer puerto;

    @Column(name = "email_remitente", length = 100, nullable = false)
    private String emailRemitente;

    @Column(name = "password_remitente", length = 200, nullable = false)
    private String passwordRemitente;

    @Column(name = "nombre_remitente", length = 100)
    private String nombreRemitente;

    @Column(name = "auth_habilitado", nullable = false)
    private Boolean authHabilitado = true;

    @Column(name = "starttls_habilitado", nullable = false)
    private Boolean starttlsHabilitado = true;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}