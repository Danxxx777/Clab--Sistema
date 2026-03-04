package com.clab.clabbackend.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "u_rol_bd_esquema_permiso", schema = "usuarios")
public class RolBdEsquemaPermiso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rbep")
    private Integer idRbep;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_rol_bd", nullable = false)
    private RolBD rolBd;

    @Column(name = "nombre_esquema", nullable = false, length = 100)
    private String nombreEsquema;

    @Column(name = "permiso_select", nullable = false)
    private boolean permisoSelect;

    @Column(name = "permiso_insert", nullable = false)
    private boolean permisoInsert;

    @Column(name = "permiso_update", nullable = false)
    private boolean permisoUpdate;

    @Column(name = "permiso_delete", nullable = false)
    private boolean permisoDelete;

    @Column(name = "fecha_asignacion", nullable = false)
    private LocalDate fechaAsignacion;

    @Column(name = "vigente", nullable = false)
    private boolean vigente;
}