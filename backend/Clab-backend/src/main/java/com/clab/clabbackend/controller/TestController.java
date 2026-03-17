package com.clab.clabbackend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@RestController
@RequestMapping("/api/test")
public class TestController {
// TODO LO DE AQUI SE TOMO PARA TESTEO NOMAS, NO ES FUNCIONAL DENTRO DE LA APP

    @GetMapping
    public String test() {
        return "CLAB backend conectado";
    }
    @GetMapping("/hash")
    public String generarHash(@RequestParam String pass) {
        return new BCryptPasswordEncoder().encode(pass);
    }

    }


