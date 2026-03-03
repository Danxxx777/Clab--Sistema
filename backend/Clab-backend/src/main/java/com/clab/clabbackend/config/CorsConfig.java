package com.clab.clabbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    // Configura las reglas globales de CORS para la aplicación
    @Override
    public void addCorsMappings(CorsRegistry registry) {

        registry.addMapping("/**") // Aplica a todas las rutas
                .allowedOrigins("http://localhost:4200") // Permite peticiones desde Angular
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Métodos HTTP
                .allowedHeaders("*") // Permite todos los headers
                .allowCredentials(true); // Permite envío de cookies o credenciales
    }
}