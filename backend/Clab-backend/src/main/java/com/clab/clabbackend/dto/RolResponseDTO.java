package com.clab.clabbackend.dto;

import java.time.LocalDate;
import java.util.List;

public class RolResponseDTO {

    private Integer idRol;
    private String nombreRol;
    private String descripcion;
    private LocalDate fechaCreacion;
    private List<String> rolesBD;

    public RolResponseDTO(Integer idRol,
                          String nombreRol,
                          String descripcion,
                          LocalDate fechaCreacion,
                          List<String> rolesBD) {
        this.idRol = idRol;
        this.nombreRol = nombreRol;
        this.descripcion = descripcion;
        this.fechaCreacion = fechaCreacion;
        this.rolesBD = rolesBD;
    }

    public Integer getIdRol() { return idRol; }
    public String getNombreRol() { return nombreRol; }
    public String getDescripcion() { return descripcion; }
    public LocalDate getFechaCreacion() { return fechaCreacion; }
    public List<String> getRolesBD() { return rolesBD; }
}