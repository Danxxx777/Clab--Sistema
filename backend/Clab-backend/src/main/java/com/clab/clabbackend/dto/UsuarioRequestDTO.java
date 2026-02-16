package com.clab.clabbackend.dto;

public class UsuarioRequestDTO {

    private String identidad;
    private String nombres;
    private String apellidos;
    private String email;
    private String telefono;
    private String contrasenia;
    private Integer idRol;

    public UsuarioRequestDTO() {
    }

    public UsuarioRequestDTO(String identidad, String nombres, String apellidos, String email, String telefono, String contrasenia, Integer idRol) {
        this.identidad = identidad;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.email = email;
        this.telefono = telefono;
        this.contrasenia = contrasenia;
        this.idRol = idRol;
    }

    public String getIdentidad() { return identidad; }
    public void setIdentidad(String identidad) { this.identidad = identidad; }

    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }

    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getContrasenia() { return contrasenia; }
    public void setContrasenia(String contrasenia) { this.contrasenia = contrasenia; }

    public Integer getIdRol() { return idRol; }
    public void setIdRol(Integer idRol) { this.idRol = idRol; }
}
