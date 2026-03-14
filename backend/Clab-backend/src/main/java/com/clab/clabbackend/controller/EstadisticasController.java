package com.clab.clabbackend.controller;

import com.clab.clabbackend.services.EquipoService;
import com.clab.clabbackend.services.LaboratorioService;
import com.clab.clabbackend.services.ReservaService;
import com.clab.clabbackend.services.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/estadisticas")
@RequiredArgsConstructor
public class EstadisticasController {

    private final LaboratorioService laboratorioService;
    private final ReservaService reservaService;
    private final UsuarioService usuarioService;
    private final EquipoService equipoService;

    @GetMapping("/login")
    public Map<String, Object> estadisticasLogin() {

        // Labs activos
        long labsActivos = laboratorioService.listar()
                .stream()
                .filter(l -> {
                    try {
                        Object estado = l.getClass().getMethod("getEstado").invoke(l);
                        return estado != null && estado.toString().equalsIgnoreCase("activo");
                    } catch (Exception e) {
                        return true;
                    }
                })
                .count();

        // Reservas del mes actual
        LocalDate hoy = LocalDate.now();
        LocalDate inicioMes = hoy.withDayOfMonth(1);
        LocalDate finMes = hoy.withDayOfMonth(hoy.lengthOfMonth());
        long reservasMes = reservaService.listarPorSemana(inicioMes, finMes).size();

        // Usuarios activos
        long usuariosActivos = usuarioService.listar()
                .stream()
                .filter(u -> {
                    try {
                        Object estado = u.getClass().getMethod("isActivo").invoke(u);
                        return Boolean.TRUE.equals(estado);
                    } catch (Exception e) {
                        try {
                            Object estado = u.getClass().getMethod("getActivo").invoke(u);
                            return Boolean.TRUE.equals(estado);
                        } catch (Exception ex) {
                            return true;
                        }
                    }
                })
                .count();

        // Equipos registrados
        long equiposRegistrados = equipoService.listar().size();

        return Map.of(
                "labsActivos",        labsActivos,
                "reservasMes",        reservasMes,
                "usuariosActivos",    usuariosActivos,
                "equiposRegistrados", equiposRegistrados
        );
    }
}