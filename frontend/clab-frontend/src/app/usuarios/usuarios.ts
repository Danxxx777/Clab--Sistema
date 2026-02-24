import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

  /* CONSTRUCTOR*/

  constructor(
    private router: Router,
    private rolService: RolService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  /* =========================
     ESTADO GENERAL
  ==========================*/

  guardandoRol = false;

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

  permisosDisponibles: any[] = [];
  permisosSeleccionados: number[] = [];

  busqueda = '';
  filtroEstado = 'Todos';
  filtroRol: number | 'Todos' = 'Todos';

  rolesBDDisponibles: string[] = [];
  rolesBDSeleccionados: string[] = [];
  rolesBD: string[] = [];

  usuarioLogueado: string = '';
  rolActualHeader = '';

  /* =========================
     PAGINACIÓN USUARIOS
  ==========================*/
  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 1;
  usuariosPaginados: Usuario[] = [];

  /* =========================
     PAGINACIÓN ROLES
  ==========================*/

  paginaRoles = 1;
  itemsPorPaginaRoles = 10;   // 👈 variable propia, NO comparte con usuarios
  totalPaginasRoles = 1;
  rolesPaginados: RolView[] = [];

  /* =========================
     INIT ORIGINAL (NO TOCAR)
  ==========================*/

  /*INIT
  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
    this.cargarPermisos();
    this.rolService.listarRolesBD().subscribe(data => {
      this.rolesBDDisponibles = data;
    });
  }*/

  /* =========================
     LIFECYCLE
  ==========================*/

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
    this.cargarPermisos();
    this.usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';
    this.rolActualHeader = localStorage.getItem('rol') || '';

    const usuario = localStorage.getItem('usuario');
    const rol = localStorage.getItem('rol');
    this.usuarioLogueado = usuario || rol || 'Usuario';

    this.rolService.listarRolesBD().subscribe(data => {
      this.rolesBDDisponibles = data;

      const usuario = localStorage.getItem('usuario');
      const rol = localStorage.getItem('rol');

      this.usuarioLogueado = usuario ? `${usuario} · ${rol ?? ''}` : '';

      if (usuario) {
        this.usuarioLogueado = rol ? `${usuario} (${rol})` : usuario;
      }
    });

    // Leer usuario logueado del localStorage (ajusta la key según tu auth)
    const userData = localStorage.getItem('usuario') || localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        this.usuarioLogueado = parsed.nombres
          ? `${parsed.nombres} ${parsed.apellidos}`
          : parsed.email || parsed.usuario || 'Usuario';
      } catch {
        this.usuarioLogueado = userData;
      }
    }
  }

  /* =========================
     NAVEGACIÓN / UI
  ==========================*/

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  cambiarTab(index: number): void {
    this.tabActiva = index;
    // Resetear paginación al cambiar de tab
    this.paginaActual = 1;
    this.paginaRoles = 1;
    this.actualizarPaginacion();
    this.actualizarPaginacionRoles();
  }
  /* =========================
     USUARIOS
  ==========================*/

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
        this.cdr.detectChanges();
      },
      error: err => console.error('Error cargando usuarios', err)
    });
  }

  abrirModalUsuario(modo: 'crear' | 'editar' | 'ver', u?: Usuario): void {
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
    this.cdr.detectChanges();
  }

  filtrarUsuarios(): void {
    const texto = this.busqueda.toLowerCase();

    this.usuariosFiltrados = this.usuarios.filter(u =>
      (`${u.nombres} ${u.apellidos} ${u.email} ${u.identidad}`
        .toLowerCase()
        .includes(texto)) &&
      (this.filtroEstado === 'Todos' ||
        u.estado?.toUpperCase() === this.filtroEstado.toUpperCase()) &&
      (this.filtroRol === 'Todos' || u.idRol === this.filtroRol)
    );

    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  actualizarPaginacion(): void {
    this.totalPaginas = Math.ceil(this.usuariosFiltrados.length / this.itemsPorPagina);
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.usuariosPaginados = this.usuariosFiltrados.slice(inicio, fin);
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  /* =========================
     ROLES
  ==========================*/

  cargarRoles(): void {
    this.rolService.listar().subscribe({
      next: (data: RolResponse[]) => {
        this.roles = data.map(r => ({
          id: r.idRol,
          nombre: r.nombreRol,
          descripcion: r.descripcion,
          fechaCreacion: r.fechaCreacion
        }));
        this.actualizarPaginacionRoles(); // 👈 agregar esto
      }
    });
  }

  actualizarPaginacionRoles(): void {
    this.totalPaginasRoles = Math.ceil(this.roles.length / this.itemsPorPaginaRoles);
    const inicio = (this.paginaRoles - 1) * this.itemsPorPaginaRoles;
    this.rolesPaginados = this.roles.slice(inicio, inicio + this.itemsPorPaginaRoles);
  }

  irAPaginaRoles(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginasRoles) return;
    this.paginaRoles = pagina;
    this.actualizarPaginacionRoles();
  }

  get paginasRoles(): number[] {
    return Array.from({ length: this.totalPaginasRoles }, (_, i) => i + 1);
  }

  abrirModalRol(modo: 'crear' | 'editar', r?: RolView): void {
    this.modoModal = modo;
    this.permisosSeleccionados = [];
    this.cargarRolesBD();

    if (modo === 'crear') {
      this.rolActual = {
        nombre: '',
        descripcion: '',
        fechaCreacion: new Date().toISOString().substring(0, 10)
      };
    } else if (r) {
      this.rolActual = { ...r };

      if (r.id) {
        this.rolService.obtenerPermisos(r.id).subscribe({
          next: (ids: number[]) => {
            this.permisosSeleccionados = ids;
            this.cdr.detectChanges();
          },
          error: err => {
            console.error('Error cargando permisos del rol', err);
          }
        });
      }
    }

    this.mostrarModalRol = true;
  }

  guardarRol(): void {
    if (!this.rolActual.nombre?.trim()) {
      alert('El nombre del rol es obligatorio');
      return;
    }

    const payload: RolRequest = {
      nombreRol: this.rolActual.nombre,
      descripcion: this.rolActual.descripcion,
      permisos: this.permisosSeleccionados,
      rolesBD: this.rolesBDSeleccionados
    };

    const request$ =
      this.modoModal === 'crear'
        ? this.rolService.crear(payload)
        : this.rolService.actualizar(this.rolActual.id!, payload);

    request$.subscribe({
      next: () => {
        alert('Rol guardado correctamente');
        this.cargarRoles();
        this.cerrarModalRol();
      },
      error: err => {
        console.error(err);
        alert('Error al guardar el rol');
      }
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
    this.permisosSeleccionados = [];   // 👈 limpiar
    this.rolActual = {
      nombre: '',
      descripcion: '',
      fechaCreacion: ''
    };
    this.cdr.detectChanges();
  }

  /* =========================
     PERMISOS / ROLES BD
  ==========================*/

  cargarPermisos(): void {
    this.http.get<any[]>('http://localhost:8080/permisos')
      .subscribe({
        next: (data) => {
          this.permisosDisponibles = data;
        },
        error: err => console.error('Error cargando permisos', err)
      });
  }

  togglePermiso(idPermiso: number) {
    if (this.permisosSeleccionados.includes(idPermiso)) {
      this.permisosSeleccionados =
        this.permisosSeleccionados.filter(id => id !== idPermiso);
    } else {
      this.permisosSeleccionados.push(idPermiso);
    }
  }

  esPermisoSeleccionado(idPermiso: number): boolean {
    return this.permisosSeleccionados.includes(idPermiso);
  }

  cargarRolesBD(): void {
    this.http.get<string[]>('http://localhost:8080/roles/roles-bd')
      .subscribe(data => {
        this.rolesBD = data;
      });
  }

  toggleRolBD(nombre: string) {
    if (this.rolesBDSeleccionados.includes(nombre)) {
      this.rolesBDSeleccionados =
        this.rolesBDSeleccionados.filter(r => r !== nombre);
    } else {
      this.rolesBDSeleccionados.push(nombre);
    }
  }

  /* =========================
     UTILIDADES
  ==========================*/

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
}
