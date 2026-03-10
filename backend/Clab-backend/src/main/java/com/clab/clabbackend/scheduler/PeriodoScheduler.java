package com.clab.clabbackend.scheduler;

import com.clab.clabbackend.entities.PeriodoAcademico;
import com.clab.clabbackend.repository.PeriodoAcademicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class PeriodoScheduler {

    @Autowired
    private PeriodoAcademicoRepository periodoRepository;

    @Scheduled(cron = "0 0 7 * * *")
    public void actualizarEstadosPeriodos() {
        LocalDate hoy = LocalDate.now();
        List<PeriodoAcademico> periodos = periodoRepository.findAll();

        // Paso 1: desactivar períodos cuya fechaFin ya pasó
        for (PeriodoAcademico p : periodos) {
            if ("ACTIVO".equals(p.getEstado()) && hoy.isAfter(p.getFechaFin())) {
                p.setEstado("INACTIVO");
                periodoRepository.save(p);
            }
        }

        // Paso 2: recargar con los cambios del paso 1
        periodos = periodoRepository.findAll();
        boolean hayActivo = periodos.stream().anyMatch(p -> "ACTIVO".equals(p.getEstado()));

        // Paso 3: si no hay ningún activo, activar el que corresponda por fecha
        if (!hayActivo) {
            periodos.stream()
                    .filter(p -> "INACTIVO".equals(p.getEstado())
                            && !hoy.isBefore(p.getFechaInicio())
                            && !hoy.isAfter(p.getFechaFin()))
                    .findFirst()
                    .ifPresent(p -> {
                        p.setEstado("ACTIVO");
                        periodoRepository.save(p);
                    });
        }
    }
}