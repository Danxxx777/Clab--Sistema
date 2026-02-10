package com.clab.clabbackend.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaForwardController {

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
        return "forward:/index.html";
    }
}
