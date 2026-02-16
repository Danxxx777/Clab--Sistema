package com.clab.clabbackend.dto;

import java.util.ArrayList;
import java.util.List;

public class RolRequestDTO {

    private String nombreRol;
    private String descripcion;

    private List<Integer> permisos = new ArrayList<>();

    public RolRequestDTO() {
    }

    public RolRequestDTO(String nombreRol, String descripcion, List<Integer> permisos) {
        this.nombreRol = nombreRol;
        this.descripcion = descripcion;
        this.permisos = permisos != null ? permisos : new ArrayList<>();
    }

    public String getNombreRol() {
        return nombreRol;
    }

    public void setNombreRol(String nombreRol) {
        this.nombreRol = nombreRol;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public List<Integer> getPermisos() {
        return permisos;
    }

    public void setPermisos(List<Integer> permisos) {
        this.permisos = permisos != null ? permisos : new ArrayList<>();
    }
}
