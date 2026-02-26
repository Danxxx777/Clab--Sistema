package com.clab.clabbackend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET_KEY =
            "CLAB_SUPER_SECRET_KEY_123456_CLAB_SUPER_SECRET_KEY";

    private Key getKey() {
        return Keys.hmacShaKeyFor(
                SECRET_KEY.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generarToken(Integer idUsuario, String rol) {

        return Jwts.builder()
                .subject(idUsuario.toString())
                .claim("rol", rol)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(getKey())
                .compact();
    }

    public Claims obtenerClaims(String token) {
        return Jwts.parser().setSigningKey((SecretKey) getKey()).build().parseSignedClaims(token).getPayload();
    }
}
