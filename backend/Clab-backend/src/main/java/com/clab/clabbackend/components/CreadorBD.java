package com.clab.clabbackend.components;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

@Slf4j
@Component
public class CreadorBD implements ApplicationListener<ApplicationEnvironmentPreparedEvent> {

    @Override
    public void onApplicationEvent(ApplicationEnvironmentPreparedEvent event) {
        String host     = event.getEnvironment().getProperty("backup.db.host", "localhost");
        String port     = event.getEnvironment().getProperty("backup.db.port", "5432");
        String dbNombre = event.getEnvironment().getProperty("backup.db.nombre", "CLAB");
        String usuario  = event.getEnvironment().getProperty("backup.db.usuario", "postgres");
        String password = event.getEnvironment().getProperty("backup.db.password", "");

        String url = "jdbc:postgresql://" + host + ":" + port + "/postgres";
        try (Connection conn = DriverManager.getConnection(url, usuario, password);
             Statement stmt = conn.createStatement()) {
            stmt.execute("CREATE DATABASE \"" + dbNombre + "\"");
            log.info("BD '{}' creada automáticamente", dbNombre);
        } catch (Exception e) {
            log.info("BD '{}' ya existe: {}", dbNombre, e.getMessage());
        }
    }
}