package com.clab.clabbackend.dto;

public class RolBDDTO {
    private Integer idRolBd;
    private String nombreRolBd;
    private String descripcion;

    public RolBDDTO(Integer idRolBd, String nombreRolBd, String descripcion) {
        this.idRolBd = idRolBd;
        this.nombreRolBd = nombreRolBd;
        this.descripcion = descripcion;
    }

    public Integer getIdRolBd() { return idRolBd; }
    public String getNombreRolBd() { return nombreRolBd; }
    public String getDescripcion() { return descripcion; }
}