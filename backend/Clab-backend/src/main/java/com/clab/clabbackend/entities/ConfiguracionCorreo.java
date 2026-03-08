package com.clab.clabbackend.entities;

import com.clab.clabbackend.util.PasswordEncriptadoConverter;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "c_configuracion_correo", schema = "configuracion")
public class ConfiguracionCorreo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_config")
    private Integer idConfig;

    @Column(name = "nombre_display", length = 100)
    private String nombreDisplay;

    @Column(name = "proposito", length = 50)
    private String proposito; // GENERAL, RECUPERACION, NOTIFICACIONES, RESERVAS, REPORTES

    @Column(name = "host", length = 100, nullable = false)
    private String host;

    @Column(name = "puerto", nullable = false)
    private Integer puerto;

    @Column(name = "email_remitente", length = 100, nullable = false)
    private String emailRemitente;

    @Convert(converter = PasswordEncriptadoConverter.class)
    @Column(name = "password_remitente", length = 500, nullable = false)
    private String passwordRemitente;

    @Column(name = "nombre_remitente", length = 100)
    private String nombreRemitente;

    @Column(name = "auth_habilitado", nullable = false)
    private Boolean authHabilitado = true;

    @Column(name = "starttls_habilitado", nullable = false)
    private Boolean starttlsHabilitado = true;


    @Column(name = "ssl_habilitado", nullable = false, columnDefinition = "boolean default false")
    private Boolean sslHabilitado = false;


    @Column(name = "protocolo", length = 10, nullable = false, columnDefinition = "varchar(10) default 'SMTP'")
    private String protocolo = "SMTP";


    @Column(name = "timeout_ms", nullable = false, columnDefinition = "integer default 5000")
    private Integer timeoutMs = 5000;


    @Column(name = "proveedor", length = 30)
    private String proveedor; // GMAIL | OUTLOOK | YAHOO | CUSTOM

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}