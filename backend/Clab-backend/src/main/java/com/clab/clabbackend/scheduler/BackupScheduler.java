package com.clab.clabbackend.scheduler;

import com.clab.clabbackend.entities.BackupConfig;
import com.clab.clabbackend.repository.BackupConfigRepository;
import com.clab.clabbackend.services.BackupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;


@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class BackupScheduler {

    private final BackupConfigRepository configRepository;
    private final BackupService          backupService;

    // Formateador para comparar horas: "HH:mm"
    private static final DateTimeFormatter FORMATO_HORA = DateTimeFormatter.ofPattern("HH:mm");

    @Scheduled(cron = "0 * * * * *")
    public void tick() {
        // Leer configuración actual de la BD
        configRepository.findById(1L).ifPresent(config -> {

            // Si el schedule está desactivado, no hacer nada
            if (!config.isActivo()) return;

            LocalDateTime ahora     = LocalDateTime.now();
            String        horaActual = ahora.format(FORMATO_HORA); // "14:35"
            // Verificar si la hora actual está en la lista de horas configuradas
            boolean estaEnLasHoras = config.getHorasList()
                    .stream()
                    .map(String::trim)
                    .anyMatch(h -> h.equals(horaActual));

            if (!estaEnLasHoras) return; // No toca en esta hora, salir
            // Verificar si el día actual cumple con la frecuencia configurada
            boolean tocaHoy = verificarSiTocaHoy(config, ahora);

            if (tocaHoy) {
                log.info("Scheduler: ejecutando backup automático — {} {}", horaActual,
                        config.getFrecuencia());
                backupService.ejecutarBackupAutomatico();
            }
        });
    }
    private boolean verificarSiTocaHoy(BackupConfig config, LocalDateTime ahora) {
        return switch (config.getFrecuencia()) {

            case DIARIO -> true;
            case SEMANAL -> {
                String diaHoy = ahora.getDayOfWeek().name();
                boolean toca  = config.getDiasSemanaList().contains(diaHoy);
                if (toca) log.debug("Scheduler semanal: hoy es {} y está en la lista", diaHoy);
                yield toca;
            }
            case MENSUAL -> {
                int diaDelMes = ahora.getDayOfMonth();
                boolean toca  = config.getDiasMesList().contains(diaDelMes);
                if (toca) log.debug("Scheduler mensual: hoy es día {} y está en la lista", diaDelMes);
                yield toca;
            }
        };
    }
}