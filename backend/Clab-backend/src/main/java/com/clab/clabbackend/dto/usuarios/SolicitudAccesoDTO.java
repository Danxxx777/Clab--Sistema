// com/clab/clabbackend/dto/SolicitudAccesoDTO.java
package com.clab.clabbackend.dto.usuarios;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SolicitudAccesoDTO {
    private Integer id;
    private String identidad;
    private String nombres;
    private String apellidos;
    private String email;
    private String telefono;
    private String motivo;
    private String estado;
    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaResolucion;
    private Integer idAdminResolvio;
    private String observacionRechazo;
    private Integer idRolSolicitado;
}