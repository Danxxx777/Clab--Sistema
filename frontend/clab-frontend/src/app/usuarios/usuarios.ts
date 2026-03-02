import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { RolService, RolRequest, RolResponse, RolBD } from '../services/rol.service';
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
  guardandoUsuario = false;
  mostrarNotificacion = false;
  notificacionTitulo = '';
  notificacionMensaje = '';
  notificacionTipo: 'exito' | 'error' | 'confirmar' = 'exito';
  accionPendiente: (() => void) | null = null;

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

  rolesBDDisponibles: RolBD[] = [];
  rolesBDSeleccionados: string[] = [];
  rolesBD: string[] = [];

  usuarioLogueado: string = '';
  rolActualHeader = '';
  rol = '';

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
  itemsPorPaginaRoles = 10;
  totalPaginasRoles = 1;
  rolesPaginados: RolView[] = [];

  /* =========================
     DRAWER
  ==========================*/
  drawerAbierto = false;

  toggleDrawer(): void {
    this.drawerAbierto = !this.drawerAbierto;
  }

  cerrarDrawer(): void {
    this.drawerAbierto = false;
  }

  /* =========================
     LIFECYCLE
  ==========================*/
  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
    this.cargarPermisos();

    this.rol = localStorage.getItem('rol') || '';
    this.rolActualHeader = this.rol;

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
    } else {
      this.usuarioLogueado = 'Usuario';
    }

    this.rolService.listarRolesBD().subscribe(data => {
      this.rolesBDDisponibles = data;
    });
  }

  /* =========================
     NAVEGACIÓN / UI
  ==========================*/
  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  navegar(ruta: string, texto: string): void {
    this.cerrarDrawer();
    this.router.navigate([`/${ruta}`]);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  cambiarTab(index: number): void {
    this.tabActiva = index;
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
          idsRoles: u.roles?.map(r => r.idRol) ?? [],
          roles: u.roles ?? [],
          rolNombre: u.roles?.[0]?.nombreRol ?? 'Sin rol', // primer rol para tabla
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
        identidad: '', nombres: '', apellidos: '',
        email: '', telefono: '', usuario: '',
        contrasenia: '', idsRoles: [], estado: 'ACTIVO'
      };
    } else if (u) {
      this.usuarioActual = { ...u, contrasenia: '', idsRoles: u.idsRoles ?? [] };
    }
    this.mostrarModalUsuario = true;
  }

  // Toggle para seleccionar/deseleccionar un rol en el modal
  toggleRolUsuario(idRol: number): void {
    if (!this.usuarioActual.idsRoles) this.usuarioActual.idsRoles = [];
    const idx = this.usuarioActual.idsRoles.indexOf(idRol);
    if (idx >= 0) {
      this.usuarioActual.idsRoles.splice(idx, 1);
    } else {
      this.usuarioActual.idsRoles.push(idRol);
    }
  }

  estaRolSeleccionado(idRol: number): boolean {
    return this.usuarioActual?.idsRoles?.includes(idRol) ?? false;
  }

  guardarUsuario(): void {
    const esCrear = this.modoModal === 'crear';
    const esEditar = this.modoModal === 'editar';

    if (
      !this.usuarioActual.identidad || !this.usuarioActual.nombres ||
      !this.usuarioActual.apellidos || !this.usuarioActual.email ||
      !this.usuarioActual.idsRoles?.length ||
      (esCrear && !this.usuarioActual.contrasenia)
    ) {
      this.mostrarAlerta('Campos incompletos', 'Complete todos los campos obligatorios.', 'error');
      return;
    }

    const payload: UsuarioRequest = {
      identidad: this.usuarioActual.identidad,
      nombres: this.usuarioActual.nombres,
      apellidos: this.usuarioActual.apellidos,
      email: this.usuarioActual.email,
      telefono: this.usuarioActual.telefono,
      contrasenia: this.usuarioActual.contrasenia || '',
      idsRoles: this.usuarioActual.idsRoles ?? []
    };

    this.guardandoUsuario = true;

    if (esCrear) {
      this.usuarioService.crear(payload).subscribe({
        next: () => {
          this.guardandoUsuario = false;
          this.cerrarModalUsuario();
          this.cargarUsuarios();
          this.registrarAuditoria('Crear usuario', 'Usuarios');
          this.mostrarAlerta('¡Usuario creado!', `El usuario ${payload.nombres} ${payload.apellidos} fue creado correctamente.`, 'exito');
        },
        error: err => {
          this.guardandoUsuario = false;
          console.error(err);
          this.mostrarAlerta('Error', 'No se pudo crear el usuario.', 'error');
        }
      });
      return;
    }

    if (esEditar) {
      if (!this.usuarioActual.id) {
        this.guardandoUsuario = false;
        this.mostrarAlerta('Error', 'No se encontró el ID del usuario.', 'error');
        return;
      }
      this.usuarioService.actualizar(this.usuarioActual.id, payload).subscribe({
        next: () => {
          this.guardandoUsuario = false;
          this.cerrarModalUsuario();
          this.cargarUsuarios();
          this.registrarAuditoria('Actualizar usuario', 'Usuarios');
          this.mostrarAlerta('¡Usuario actualizado!', `El usuario ${payload.nombres} ${payload.apellidos} fue actualizado correctamente.`, 'exito');
        },
        error: err => {
          this.guardandoUsuario = false;
          console.error(err);
          this.mostrarAlerta('Error', 'No se pudo actualizar el usuario.', 'error');
        }
      });
    }
  }

  desactivarUsuario(u: Usuario): void {
    if (!u.id) return;
    this.accionPendiente = () => {
      this.usuarioService.desactivar(u.id!).subscribe(() => {
        this.cargarUsuarios();
        this.registrarAuditoria('Desactivar usuario', 'Usuarios');
        this.mostrarAlerta('Usuario desactivado', `${u.nombres} ${u.apellidos} fue desactivado.`, 'exito');
      });
    };
    this.mostrarAlerta('¿Desactivar usuario?', `¿Estás seguro de desactivar a ${u.nombres} ${u.apellidos}?`, 'confirmar');
  }

  cerrarModalUsuario(): void {
    this.mostrarModalUsuario = false;
    this.modoModal = 'crear';
    this.cdr.detectChanges();
  }

  filtrarUsuarios(): void {
    const texto = this.busqueda.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(u =>
      (`${u.nombres} ${u.apellidos} ${u.email} ${u.identidad}`.toLowerCase().includes(texto)) &&
      (this.filtroEstado === 'Todos' || u.estado?.toUpperCase() === this.filtroEstado.toUpperCase()) &&
      (this.filtroRol === 'Todos' || u.idsRoles?.includes(this.filtroRol as number))
    );
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  actualizarPaginacion(): void {
    this.totalPaginas = Math.ceil(this.usuariosFiltrados.length / this.itemsPorPagina);
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    this.usuariosPaginados = this.usuariosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
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
          fechaCreacion: r.fechaCreacion,
          rolesBD: r.rolesBD ?? [],
          estado: r.estado ?? 'ACTIVO'
        }));
        this.actualizarPaginacionRoles();
        this.cdr.detectChanges();
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
    this.rolesBDSeleccionados = [];

    if (modo === 'crear') {
      this.rolActual = {
        nombre: '', descripcion: '',
        fechaCreacion: new Date().toISOString().substring(0, 10)
      };
      this.cargarRolesBD();
    } else if (r) {
      this.rolActual = { ...r };

      if (r.id) {
        this.rolService.listar().subscribe({
          next: (data) => {
            const rolActualizado = data.find(x => x.idRol === r.id);
            this.rolesBDSeleccionados = rolActualizado?.rolesBD?.map(rb => rb.nombreRolBd) ?? [];
            this.cdr.detectChanges();
          }
        });

        this.rolService.obtenerPermisos(r.id).subscribe({
          next: (ids: number[]) => {
            this.permisosSeleccionados = ids;
            this.cdr.detectChanges();
          }
        });
      }

      this.cargarRolesBD();
    }

    this.mostrarModalRol = true;
  }

  guardarRol(): void {
    if (!this.rolActual.nombre?.trim()) {
      this.mostrarAlerta('Campo requerido', 'El nombre del rol es obligatorio.', 'error');
      return;
    }

    const payload: RolRequest = {
      nombreRol: this.rolActual.nombre,
      descripcion: this.rolActual.descripcion,
      permisos: this.permisosSeleccionados,
      rolesBD: this.rolesBDSeleccionados
    };

    this.guardandoRol = true;

    const request$ = this.modoModal === 'crear'
      ? this.rolService.crear(payload)
      : this.rolService.actualizar(this.rolActual.id!, payload);

    request$.subscribe({
      next: () => {
        this.guardandoRol = false;
        this.cerrarModalRol();
        this.cargarRoles();
        this.mostrarAlerta('¡Rol guardado!', `El rol "${payload.nombreRol}" fue guardado correctamente.`, 'exito');
      },
      error: err => {
        this.guardandoRol = false;
        console.error(err);
        this.mostrarAlerta('Error', 'No se pudo guardar el rol.', 'error');
      }
    });
  }

  eliminarRol(r: RolView): void {
    if (!r.id) return;
    this.accionPendiente = () => {
      this.rolService.eliminar(r.id!).subscribe(() => {
        this.cargarRoles();
        this.registrarAuditoria('Eliminar rol', 'Roles');
        this.mostrarAlerta('Rol eliminado', `El rol "${r.nombre}" fue eliminado correctamente.`, 'exito');
      });
    };
    this.mostrarAlerta('¿Eliminar rol?', `¿Estás seguro de eliminar el rol "${r.nombre}"?`, 'confirmar');
  }
  desactivarRol(r: RolView): void {
    if (!r.id) return;
    this.accionPendiente = () => {
      this.rolService.desactivar(r.id!).subscribe(() => {
        this.cargarRoles();
        this.registrarAuditoria('Desactivar rol', 'Roles');
        this.mostrarAlerta('Rol desactivado', `El rol "${r.nombre}" fue desactivado.`, 'exito');
      });
    };
    this.mostrarAlerta('¿Desactivar rol?', `¿Estás seguro de desactivar el rol "${r.nombre}"?`, 'confirmar');
  }

  cerrarModalRol(): void {
    this.mostrarModalRol = false;
    this.guardandoRol = false;
    this.permisosSeleccionados = [];
    this.rolActual = { nombre: '', descripcion: '', fechaCreacion: '' };
    this.cdr.detectChanges();
  }

  /* =========================
     PERMISOS / ROLES BD
  ==========================*/
  cargarPermisos(): void {
    this.http.get<any[]>('http://localhost:8080/permisos').subscribe({
      next: (data) => { this.permisosDisponibles = data; },
      error: err => console.error('Error cargando permisos', err)
    });
  }

  togglePermiso(idPermiso: number): void {
    if (this.permisosSeleccionados.includes(idPermiso)) {
      this.permisosSeleccionados = this.permisosSeleccionados.filter(id => id !== idPermiso);
    } else {
      this.permisosSeleccionados.push(idPermiso);
    }
  }

  esPermisoSeleccionado(idPermiso: number): boolean {
    return this.permisosSeleccionados.includes(idPermiso);
  }

  cargarRolesBD(): void {
    this.http.get<string[]>('http://localhost:8080/roles/roles-bd').subscribe(data => {
      this.rolesBD = data;
    });
  }

  toggleRolBD(nombre: string): void {
    if (this.rolesBDSeleccionados.includes(nombre)) {
      this.rolesBDSeleccionados = this.rolesBDSeleccionados.filter(r => r !== nombre);
    } else {
      this.rolesBDSeleccionados.push(nombre);
    }
  }

  /* =========================
     UTILIDADES
  ==========================*/
  getEstadoClass(estado?: string): string {
    return estado === 'Activo' || estado === 'ACTIVO' ? 'activo' : 'inactivo';
  }

  registrarAuditoria(accion: string, modulo: string): void {
    this.auditorias.unshift({
      usuario: 'Sistema',
      accion,
      modulo,
      fecha: new Date().toLocaleString()
    });
  }

  mostrarAlerta(titulo: string, mensaje: string, tipo: 'exito' | 'error' | 'confirmar'): void {
    this.notificacionTitulo = titulo;
    this.notificacionMensaje = mensaje;
    this.notificacionTipo = tipo;
    this.mostrarNotificacion = true;
    this.cdr.detectChanges();
  }

  cerrarNotificacion(): void {
    this.mostrarNotificacion = false;
    this.accionPendiente = null;
    this.cdr.detectChanges();
  }

  confirmarAccion(): void {
    this.mostrarNotificacion = false;
    if (this.accionPendiente) {
      this.accionPendiente();
      this.accionPendiente = null;
    }
    this.cdr.detectChanges();
  }

  get usuariosActivos(): number {
    return this.usuarios.filter(u => u.estado?.toUpperCase() === 'ACTIVO').length;
  }

  get usuariosInactivos(): number {
    return this.usuarios.filter(u => u.estado?.toUpperCase() !== 'ACTIVO').length;
  }
}
