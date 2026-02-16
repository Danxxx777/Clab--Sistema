package com.clab.clabbackend.dto;

public class LoginResponseDTO {

    private String token;
    private Integer idUsuario;
    private String rol;

    public LoginResponseDTO(String token, Integer idUsuario, String rol) {
        this.token = token;
        this.idUsuario = idUsuario;
        this.rol = rol;
    }

    public String getToken() { return token; }
    public Integer getIdUsuario() { return idUsuario; }
    public String getRol() { return rol; }
}
