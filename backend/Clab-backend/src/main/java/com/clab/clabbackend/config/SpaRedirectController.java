package com.clab.clabbackend.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaRedirectController {

    // Captura cualquier ruta que no contenga punto (.) y la redirige al index.html para que Angular maneje la navegación
    @RequestMapping(value = {"/{path:[^\\.]*}"})
    public String redirect() {

        // Forward interno hacia el index de la SPA
        return "forward:/index.html";
    }
}