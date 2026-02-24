package com.clab.clabbackend.security;

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
import java.util.List;

@Component
@Order(1)
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    // 🔥 ESTA PARTE ES LA CLAVE
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();

        // 🔥 AGREGA ESTE LOG PARA DEBUGGING
        System.out.println("🔍 Verificando ruta: " + path);

        boolean shouldSkip = path.startsWith("/auth")
                || path.startsWith("/api/test")
                || path.startsWith("/equipos")
                || path.startsWith("/tipos-equipo")
                || path.startsWith("/laboratorios")
                || path.startsWith("/reportes")
                || path.startsWith("/sedes")
                || path.startsWith("/tipos-reserva")
                || path.startsWith("/reservas")
                || path.startsWith("/asignaturas")
                || path.startsWith("/horarios")
                || path.startsWith("/periodos");

        System.out.println("✅ ¿Saltar filtro? " + shouldSkip);

        return shouldSkip;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // 🔥 PERMITE PREFLIGHT (OPTIONS)
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

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                username,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + rol))
                        );

                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (Exception e) {
                System.out.println(" Error validando token: " + e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
