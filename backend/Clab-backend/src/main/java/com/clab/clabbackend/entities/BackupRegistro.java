package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "backup_registro", schema = "configuracion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackupRegistro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoBackup tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoBackup estado;

    @Column(length = 50)
    private String tamano;

    @Column(length = 500)
    private String rutaLocal;

    @Column(length = 200)
    private String rutaDrive;

    @Column(columnDefinition = "TEXT")
    private String error;

    @Column(length = 150)
    private String ejecutadoPor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ModalidadBackup modalidad = ModalidadBackup.COMPLETO;

    @Column
    private Integer tablasIncluidas;

    // Enums
    public enum TipoBackup {
        MANUAL, AUTOMATICO
    }

    public enum EstadoBackup {
        EXITOSO, FALLIDO
    }

    public enum ModalidadBackup {
        COMPLETO,
        DIFERENCIAL,
        INCREMENTAL
    }
}