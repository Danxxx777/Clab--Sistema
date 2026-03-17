package com.clab.clabbackend.security;

import com.clab.clabbackend.repository.SesionActivaRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.core.annotation.Order;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
@Order(1)
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final SesionActivaRepository sesionActivaRepository;

    public JwtAuthenticationFilter(JwtService jwtService,
                                   CustomUserDetailsService userDetailsService,
                                   SesionActivaRepository sesionActivaRepository) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.sesionActivaRepository = sesionActivaRepository;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/auth")
                || path.startsWith("/api/test")
                || path.startsWith("/roles")
                || path.startsWith("/equipos")
                || path.startsWith("/tipos-equipo")
                || path.startsWith("/laboratorios")
                || path.startsWith("/reportes")
                || path.startsWith("/sedes")
                || path.startsWith("/tipos-reserva")
                || path.startsWith("/facultades")
                || path.startsWith("/carreras")
                || path.startsWith("/asignaturas")
                || path.startsWith("/horarios")
                || path.startsWith("/bloqueos")
                || path.startsWith("/api/reportes");
    }
    private String hashToken(String token) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            return token.substring(0, Math.min(token.length(), 255));
        }
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if ("OPTIONS".equals(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = jwtService.obtenerClaims(token);
                String username = claims.getSubject();
                String rol = claims.get("rol", String.class);

                // Verificar que la sesión sigue activa en BD
                String tokenHash = hashToken(token);

                boolean sesionValida = sesionActivaRepository
                        .findByTokenHash(tokenHash)
                        .map(s -> s.getActiva())
                        .orElse(false);

                if (!sesionValida) {
                    SecurityContextHolder.clearContext();
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"SESSION_EXPIRED\"}");
                    return;
                }

                List<SimpleGrantedAuthority> authorities = new ArrayList<>();

                // Agregar rol como authority
                if (rol != null) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + rol.toUpperCase()));
                }

                // Agregar permisos como authorities
                List<?> permisos = claims.get("permisos", List.class);
                if (permisos != null) {
                    for (Object permiso : permisos) {
                        authorities.add(new SimpleGrantedAuthority("PERMISO_" + permiso.toString().toUpperCase()));
                    }
                }

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(username, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (Exception e) {
                System.out.println("Error validando token: " + e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}