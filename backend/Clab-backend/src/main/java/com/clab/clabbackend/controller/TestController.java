package com.clab.clabbackend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:4200")
public class TestController {

    @GetMapping
    public String test() {
        return "CLAB backend conectado";
    }
}
