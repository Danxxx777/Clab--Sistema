package com.clab.clabbackend.components;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@Order(1)
public class InicializadorSchemas implements ApplicationRunner {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String[] schemas = {
                "academico", "configuracion", "inventario", "laboratorios",
                "notificaciones", "organizacion", "public", "recursos",
                "reportes", "reservas", "seguridad", "seguridad_bd", "usuarios"
        };
        for (String schema : schemas) {
            try {
                entityManager.createNativeQuery("CREATE SCHEMA IF NOT EXISTS " + schema).executeUpdate();
            } catch (Exception e) {
            }
        }
    }
}