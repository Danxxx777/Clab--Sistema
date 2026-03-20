package com.clab.clabbackend.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;
import java.io.Serializable;

@Data
@Embeddable
public class ModuloRolId implements Serializable {

    @Column(name = "id_modulo")
    private Integer idModulo;

    @Column(name = "id_rol")
    private Integer idRol;
}