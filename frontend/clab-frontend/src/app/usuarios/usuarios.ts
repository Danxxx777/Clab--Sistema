import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { RolService, RolRequest, RolResponse } from '../services/rol.service';
import { UsuarioService, UsuarioRequest, UsuarioResponse } from '../services/usuario.service';
import { Usuario } from '../interfaces/Usuario.model';
import { RolView } from '../interfaces/Rol.model';
import { Auditoria } from '../interfaces/Auditoria.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss']
})
export class UsuariosComponent implements OnInit {

  guardandoRol = false;

  constructor(
    private router: Router,
    private rolService: RolService,
    private usuarioService: UsuarioService
  ) {
  }

  /* ESTADO GENERAL*/
  tabActiva = 0;
  mostrarModalUsuario = false;
  mostrarModalRol = false;
  modoModal: 'crear' | 'editar' | 'ver' = 'crear';
  usuarioActual!: Usuario;
  rolActual!: RolView;
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  roles: RolView[] = [];
  auditorias: Auditoria[] = [];
  busqueda = '';
  filtroEstado = 'Todos';
  filtroRol = 'Todos';

  /*INIT */
  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  cambiarTab(index: number): void {
    this.tabActiva = index;
  }

  filtrarUsuarios(): void {
    const texto = this.busqueda.toLowerCase();

    this.usuariosFiltrados = this.usuarios.filter(u =>
      (`${u.nombres} ${u.apellidos} ${u.email} ${u.identidad}`
        .toLowerCase()
        .includes(texto)) &&
      (this.filtroEstado === 'Todos' || u.estado === this.filtroEstado) &&
      (this.filtroRol === 'Todos' || u.rolNombre === this.filtroRol)
    );
  }

  /* USUARIOS*/
  cargarUsuarios(): void {
    this.usuarioService.listar().subscribe({
      next: (data: UsuarioResponse[]) => {
        this.usuarios = data.map(u => ({
          id: u.idUsuario,
          identidad: u.identidad,
          nombres: u.nombres,
          apellidos: u.apellidos,
          email: u.email,
          telefono: u.telefono,
          usuario: u.usuario,
          idRol: u.idRol,
          rolNombre: u.nombreRol ?? 'Sin rol',

          estado: u.estado,
          fechaRegistro: u.fechaRegistro
        }));

        this.filtrarUsuarios();
      },
      error: err => console.error('Error cargando usuarios', err)
    });
  }

  abrirModalUsuario(
    modo: 'crear' | 'editar' | 'ver',
    u?: Usuario
  ): void {

    this.modoModal = modo;
    if (modo === 'crear') {
      this.usuarioActual = {
        identidad: '',
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        usuario: '',
        contrasenia: '',
        idRol: undefined,
        estado: 'ACTIVO'
      };
    } else if (u) {
      this.usuarioActual = {
        ...u,
        contrasenia: ''
      };
    }

    this.mostrarModalUsuario = true;
  }

  guardarUsuario(): void {

    const esCrear = this.modoModal === 'crear';
    const esEditar = this.modoModal === 'editar';

    if (
      !this.usuarioActual.identidad ||
      !this.usuarioActual.nombres ||
      !this.usuarioActual.apellidos ||
      !this.usuarioActual.email ||
      !this.usuarioActual.idRol ||
      (esCrear && !this.usuarioActual.contrasenia)
    ) {
      alert('Complete todos los campos obligatorios');
      return;
    }

    const payload: UsuarioRequest = {
      identidad: this.usuarioActual.identidad,
      nombres: this.usuarioActual.nombres,
      apellidos: this.usuarioActual.apellidos,
      email: this.usuarioActual.email,
      telefono: this.usuarioActual.telefono,
      contrasenia: this.usuarioActual.contrasenia || '',
      idRol: this.usuarioActual.idRol
    };

    if (esCrear) {
      this.usuarioService.crear(payload).subscribe({
        next: () => {
          alert('✅ Usuario creado correctamente');
          this.cargarUsuarios();
          this.registrarAuditoria('Crear usuario', 'Usuarios');
          this.cerrarModalUsuario();
        },
        error: err => {
          console.error(err);
          alert('❌ Error al crear el usuario');
        }
      });
      return;
    }

    if (esEditar) {
      if (!this.usuarioActual.id) {
        alert('❌ No se encontró el id del usuario para actualizar');
        return;
      }

      this.usuarioService.actualizar(this.usuarioActual.id, payload).subscribe({
        next: () => {
          alert('✅ Usuario actualizado correctamente');
          this.cargarUsuarios();
          this.registrarAuditoria('Actualizar usuario', 'Usuarios');
          this.cerrarModalUsuario();
        },
        error: err => {
          console.error(err);
          alert('❌ Error al actualizar el usuario');
        }
      });
    }
  }

  desactivarUsuario(u: Usuario): void {
    if (!u.id) return;
    if (!confirm(`¿Desactivar al usuario ${u.nombres}?`)) return;

    this.usuarioService.desactivar(u.id).subscribe(() => {
      this.cargarUsuarios();
      this.registrarAuditoria('Desactivar usuario', 'Usuarios');
    });
  }

  cerrarModalUsuario(): void {
    this.mostrarModalUsuario = false;
    this.modoModal = 'crear';
  }

  cargarRoles(): void {
    this.rolService.listar().subscribe({
      next: (data: RolResponse[]) => {
        this.roles = data.map(r => ({
          id: r.idRol,
          nombre: r.nombreRol,
          descripcion: r.descripcion,
          fechaCreacion: r.fechaCreacion
        }));
      }
    });
  }

  abrirModalRol(modo: 'crear' | 'editar', r?: RolView): void {
    this.modoModal = modo;
    this.rolActual = r
      ? { ...r }
      : {
        nombre: '',
        descripcion: '',
        fechaCreacion: new Date().toISOString().substring(0, 10)
      };
    this.mostrarModalRol = true;
  }

  guardarRol(): void {
    if (this.guardandoRol) return;

    if (!this.rolActual.nombre?.trim()) {
      alert('El nombre del rol es obligatorio');
      return;
    }

    this.guardandoRol = true;

    const payload: RolRequest = {
      nombreRol: this.rolActual.nombre.trim(),
      descripcion: this.rolActual.descripcion?.trim()
    };

    const request$ =
      this.modoModal === 'crear'
        ? this.rolService.crear(payload)
        : this.rolService.actualizar(this.rolActual.id!, payload);

    request$.subscribe({
      next: () => {
        this.cargarRoles();
        this.registrarAuditoria(
          this.modoModal === 'crear' ? 'Crear rol' : 'Editar rol',
          'Roles'
        );
        this.cerrarModalRol();
      },
      error: () => alert('Error al guardar el rol'),
      complete: () => (this.guardandoRol = false)
    });
  }

  eliminarRol(r: RolView): void {
    if (!r.id) return;
    if (!confirm(`¿Eliminar el rol "${r.nombre}"?`)) return;

    this.rolService.eliminar(r.id).subscribe(() => {
      this.cargarRoles();
      this.registrarAuditoria('Eliminar rol', 'Roles');
    });
  }

  cerrarModalRol(): void {
    this.mostrarModalRol = false;
    this.guardandoRol = false;
    this.rolActual = {
      nombre: '',
      descripcion: '',
      fechaCreacion: ''
    };
  }

  /* UTILIDADES*/
  getEstadoClass(estado?: string): string {
    return estado === 'Activo' || estado === 'ACTIVO'
      ? 'activo'
      : 'inactivo';
  }

  registrarAuditoria(accion: string, modulo: string): void {
    this.auditorias.unshift({
      usuario: 'Sistema',
      accion,
      modulo,
      fecha: new Date().toLocaleString()
    });
  }
}//a
