package com.clab.clabbackend.dto;

import com.clab.clabbackend.entities.BackupConfig;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackupConfigDTO {


    private String frecuencia;
    private List<String> horas;
    private List<String> diasSemana;
    private List<Integer> diasMes;
    private boolean guardarLocal;
    private boolean guardarDrive;
    private boolean activo;
    private int retencion;
    private String rutaLocalBackup;
    private String modalidadDefault;

    // Métodos de conversión
    public static BackupConfigDTO fromEntity(BackupConfig entity) {
        return BackupConfigDTO.builder()
                .frecuencia(entity.getFrecuencia() != null
                        ? entity.getFrecuencia().name()
                        : "DIARIO")
                .horas(entity.getHorasList())
                .diasSemana(entity.getDiasSemanaList())
                .diasMes(entity.getDiasMesList())
                .guardarLocal(entity.isGuardarLocal())
                .guardarDrive(entity.isGuardarDrive())
                .activo(entity.isActivo())
                .retencion(entity.getRetencion())
                .rutaLocalBackup(entity.getRutaLocalBackup())
                .modalidadDefault(entity.getModalidadDefault() != null
                        ? entity.getModalidadDefault().name()
                        : "COMPLETO")
                .build();
    }

    public BackupConfig toEntity() {
        BackupConfig entity = new BackupConfig();
        entity.setId(1L); // Siempre id = 1, una sola fila

        entity.setFrecuencia(BackupConfig.Frecuencia.valueOf(
                frecuencia != null ? frecuencia : "DIARIO"
        ));

        // Convertir List → String separado por comas
        entity.setHoras(horas != null && !horas.isEmpty()
                ? String.join(",", horas)
                : "02:00");

        entity.setDiasSemana(diasSemana != null && !diasSemana.isEmpty()
                ? String.join(",", diasSemana)
                : null);

        entity.setDiasMes(diasMes != null && !diasMes.isEmpty()
                ? diasMes.stream().map(String::valueOf).reduce((a, b) -> a + "," + b).orElse(null)
                : null);

        entity.setGuardarLocal(guardarLocal);
        entity.setGuardarDrive(guardarDrive);
        entity.setActivo(activo);
        entity.setRetencion(retencion > 0 ? retencion : 10);
        try {
            entity.setModalidadDefault(com.clab.clabbackend.entities.BackupRegistro.ModalidadBackup
                    .valueOf(modalidadDefault != null ? modalidadDefault : "COMPLETO"));
        } catch (IllegalArgumentException e) {
            entity.setModalidadDefault(com.clab.clabbackend.entities.BackupRegistro.ModalidadBackup.COMPLETO);
        }
        entity.setRutaLocalBackup(rutaLocalBackup != null && !rutaLocalBackup.isBlank()
                ? rutaLocalBackup
                : "C:/backups");

        return entity;
    }
}