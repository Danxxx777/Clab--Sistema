package com.clab.clabbackend.controller;

import com.clab.clabbackend.dto.FotoDTO;
import com.clab.clabbackend.security.JwtService;
import com.clab.clabbackend.services.FotoService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/fotos")
@RequiredArgsConstructor
public class FotoController {
    private final FotoService fotoService;
    private final JwtService jwtService;

    // ─── HELPERS JWT ────────────────────

    private Integer obtenerIdUsuario(HttpServletRequest request) {
        try {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                Claims claims = jwtService.obtenerClaims(header.substring(7));
                Object idObj = claims.get("idUsuario");
                if (idObj != null) return Integer.parseInt(idObj.toString());
                return Integer.parseInt(claims.getSubject());
            }
        } catch (Exception ignored) {}
        return null;
    }

    // ─── ENDPOINTS ───────────────────────────────────────────────────────────

    @GetMapping("/laboratorio/{codLaboratorio}")
    public ResponseEntity<List<FotoDTO>> listar(
            @PathVariable Integer codLaboratorio) {
        return ResponseEntity.ok(
                fotoService.listarFotosPorLaboratorio(codLaboratorio)
        );
    }

    @PostMapping(value = "/subir/{codLaboratorio}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> subir(
            @PathVariable Integer codLaboratorio,
            @RequestParam("archivos") List<MultipartFile> archivos) {
        try {
            fotoService.subirFotos(codLaboratorio, archivos);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/eliminar/{idFoto}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer idFoto) {
        try {
            fotoService.eliminarFoto(idFoto);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
