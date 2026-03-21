package com.clab.clabbackend;

import com.clab.clabbackend.components.CreadorBD;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class ClabBackendApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(ClabBackendApplication.class);
        app.addListeners(new CreadorBD());
        app.run(args);
    }
}