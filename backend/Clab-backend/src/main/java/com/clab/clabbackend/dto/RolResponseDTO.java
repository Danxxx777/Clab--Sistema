package com.clab.clabbackend.dto;

import java.time.LocalDate;
import java.util.List;

public class RolResponseDTO {

    private Integer idRol;
    private String nombreRol;
    private String descripcion;
    private LocalDate fechaCreacion;
    private List<RolBDDTO> rolesBD;

    public RolResponseDTO() {}

    public RolResponseDTO(Integer idRol, String nombreRol, String descripcion, LocalDate fechaCreacion, List<RolBDDTO> rolesBD) {
        this.idRol = idRol;
        this.nombreRol = nombreRol;
        this.descripcion = descripcion;
        this.fechaCreacion = fechaCreacion;
        this.rolesBD = rolesBD;
    }

    public Integer getIdRol() { return idRol; }
    public void setIdRol(Integer idRol) { this.idRol = idRol; }

    public String getNombreRol() { return nombreRol; }
    public void setNombreRol(String nombreRol) { this.nombreRol = nombreRol; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public LocalDate getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDate fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public List<RolBDDTO> getRolesBD() { return rolesBD; }
    public void setRolesBD(List<RolBDDTO> rolesBD) { this.rolesBD = rolesBD; }
}