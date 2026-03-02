package com.clab.clabbackend.dto;

import java.util.ArrayList;
import java.util.List;

public class RolRequestDTO {

    private String nombreRol;
    private String descripcion;
    private List<String> rolesBD;
    private List<Integer> permisos = new ArrayList<>();
    private String estado;

    public List<String> getRolesBD() {
        return rolesBD;
    }

    public void setRolesBD(List<String> rolesBD) {
        this.rolesBD = rolesBD;
    }
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

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
// a ver