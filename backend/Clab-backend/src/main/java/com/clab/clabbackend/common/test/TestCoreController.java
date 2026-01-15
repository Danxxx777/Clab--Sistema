package com.clab.clabbackend.common.test;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestCoreController {

    @GetMapping("/api/core-test")
    public String testCore() {
        return "CORE OK";
    }
}
