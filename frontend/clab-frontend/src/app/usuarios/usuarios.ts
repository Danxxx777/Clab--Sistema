import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { RolService, RolRequest, RolResponse } from '../services/rol.service';
import { UsuarioService, UsuarioRequest, UsuarioResponse } from '../services/usuario.service';

/* ===============================
   INTERFACES FRONT
================================ */

interface Usuario {
  id?: number;                  // 🔥 opcional
  identidad: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  usuario: string;
  contrasenia?: string;         // solo al crear
  rol?: string;                 // 🔥 opcional
  estado?: 'Activo' | 'Inactivo'; // 🔥 opcional
  fechaRegistro?: string;       // 🔥 opcional
}


interface RolView {
  id?: number;
  nombre: string;
  descripcion?: string;
  fechaCreacion: string;
}

interface Auditoria {
  usuario: string;
  accion: string;
  modulo: string;
  fecha: string;
}

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
  ) {}

  /* ===============================
     ESTADO GENERAL
  ================================ */
  tabActiva = 0;
  mostrarModalUsuario = false;
  mostrarModalRol = false;
  modoModal: 'crear' | 'editar' | 'ver' = 'crear';

  usuarioActual!: Usuario;
  rolActual!: RolView;

  usuarios: {
    id: number;
    identidad: string;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string | undefined;
    usuario: string;
    rol: string;
    estado: string;
    fechaRegistro: string
  }[] = [];
  usuariosFiltrados: {
    id: number;
    identidad: string;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string | undefined;
    usuario: string;
    rol: string;
    estado: string;
    fechaRegistro: string
  }[] = [];
  roles: RolView[] = [];
  auditorias: Auditoria[] = [];

  busqueda = '';
  filtroEstado = 'Todos';
  filtroRol = 'Todos';

  /* ===============================
     INIT
  ================================ */
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

  /* ===============================
     USUARIOS
  ================================ */
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
          rol: 'Sin rol',
          estado: u.estado,
          fechaRegistro: u.fechaRegistro
        }));
        this.filtrarUsuarios();
      },
      error: err => console.error('Error cargando usuarios', err)
    });
  }

  filtrarUsuarios(): void {
    const texto = this.busqueda.toLowerCase();

    this.usuariosFiltrados = this.usuarios.filter(u =>
      (`${u.nombres} ${u.apellidos} ${u.email} ${u.identidad}`.toLowerCase().includes(texto)) &&
      (this.filtroEstado === 'Todos' || u.estado === this.filtroEstado) &&
      (this.filtroRol === 'Todos' || u.rol === this.filtroRol)
    );
  }

  abrirModalUsuario(modo: "crear" | "editar" | "ver", u?: {
    id: number;
    identidad: string;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string | undefined;
    usuario: string;
    rol: string;
    estado: string;
    fechaRegistro: string
  }): void {
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
        estado: 'Activo'
      };

    }

    this.mostrarModalUsuario = true;
  }

  guardarUsuario(): void {
    if (
      !this.usuarioActual.identidad ||
      !this.usuarioActual.nombres ||
      !this.usuarioActual.apellidos ||
      !this.usuarioActual.email ||
      !this.usuarioActual.contrasenia
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
      contrasenia: this.usuarioActual.contrasenia
    };

    this.usuarioService.crear(payload).subscribe({
      next: () => {
        this.cargarUsuarios();
        this.registrarAuditoria('Crear usuario', 'Usuarios');
        this.cerrarModalUsuario();
      },
      error: err => {
        console.error(err);
        alert('Error al guardar el usuario');
      }
    });
  }

  eliminarUsuario(u: {
    id: number;
    identidad: string;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string | undefined;
    usuario: string;
    rol: string;
    estado: string;
    fechaRegistro: string
  }): void {
    if (!confirm(`¿Eliminar al usuario ${u.nombres}?`)) return;

    this.usuarioService.eliminar(u.id).subscribe(() => {
      this.cargarUsuarios();
      this.registrarAuditoria('Eliminar usuario', 'Usuarios');
    });
  }

  cerrarModalUsuario(): void {
    this.mostrarModalUsuario = false;
    this.modoModal = 'crear';
  }

  /* ===============================
     ROLES (NO TOCAR)
  ================================ */
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

  /* ===============================
     UTILIDADES
  ================================ */
  private generarUsuario(nombres: string, apellidos: string): string {
    const n = nombres.trim().split(' ')[0].toLowerCase();
    const a = apellidos.trim().split(' ')[0].toLowerCase();
    return `${n}.${a}`;
  }

  getEstadoClass(estado: string): string {
    return estado === 'Activo' ? 'activo' : 'inactivo';
  }

  registrarAuditoria(accion: string, modulo: string): void {
    this.auditorias.unshift({
      usuario: 'Sistema',
      accion,
      modulo,
      fecha: new Date().toLocaleString()
    });
  }
}
