package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "c_modulo_rol", schema = "configuracion")
public class ModuloRol {

    @EmbeddedId
    private ModuloRolId id = new ModuloRolId();

    @ManyToOne
    @MapsId("idModulo")
    @JoinColumn(name = "id_modulo")
    private ModuloSistema modulo;

    @ManyToOne
    @MapsId("idRol")
    @JoinColumn(name = "id_rol")
    private Rol rol;
}