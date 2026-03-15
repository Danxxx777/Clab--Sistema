package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "backup_config", schema = "configuracion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackupConfig {

    @Id
    private Long id = 1L;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Frecuencia frecuencia;

    @Column(nullable = false, length = 100)
    private String horas;

    @Column(length = 200)
    private String diasSemana;

    @Column(length = 100)
    private String diasMes;

    @Column(nullable = false)
    private boolean guardarLocal = true;

    @Column(nullable = false)
    private boolean guardarDrive = false;

    @Column(nullable = false)
    private boolean activo = false;

    @Column(nullable = false)
    private int diasRetencion = 30;

    @Column(length = 500, nullable = false)
    private String rutaLocalBackup = "C:/backups";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BackupRegistro.ModalidadBackup modalidadDefault = BackupRegistro.ModalidadBackup.COMPLETO;

    //Enum interno
    public enum Frecuencia {
        DIARIO, SEMANAL, MENSUAL
    }

    // Helpers para convertir String ↔ List en el servicio
    public java.util.List<String> getHorasList() {
        if (horas == null || horas.isBlank()) return java.util.List.of("02:00");
        return java.util.Arrays.asList(horas.split(","));
    }

    public java.util.List<String> getDiasSemanaList() {
        if (diasSemana == null || diasSemana.isBlank()) return java.util.List.of();
        return java.util.Arrays.asList(diasSemana.split(","));
    }

    public java.util.List<Integer> getDiasMesList() {
        if (diasMes == null || diasMes.isBlank()) return java.util.List.of();
        return java.util.Arrays.stream(diasMes.split(","))
                .map(String::trim)
                .map(Integer::parseInt)
                .toList();
    }
}