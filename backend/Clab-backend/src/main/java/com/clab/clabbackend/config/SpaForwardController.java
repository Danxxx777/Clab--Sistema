package com.clab.clabbackend.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaForwardController {

    // Redirige las rutas del frontend  hacia index.html para que el enrutador de Angular las maneje
    @RequestMapping({
            "/",
            "/usuarios",
            "/roles",
            "/equipos",
            "/sedes",
            "/laboratorios",
            "/dashboard"
    })
    public String forward() {
        // Forward interno hacia el index de la SPA
        return "forward:/index.html";
    }
}