package com.clab.clabbackend.dto;

public record RolBdEsquemaPermisoDTO(
        Integer idRolBd,
        String nombreRolBd,
        String nombreEsquema,
        boolean select,
        boolean insert,
        boolean update,
        boolean delete
) {}