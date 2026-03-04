package com.clab.clabbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class ClabBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ClabBackendApplication.class, args);
	}

}
