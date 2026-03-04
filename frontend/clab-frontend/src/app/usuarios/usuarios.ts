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
  errorModal = '';

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

  usuarioLogueado = '';
  rol = '';

  // Preview del usuario generado
  usuarioPreview = '';

  /*
     PAGINACIÓN USUARIOS
  */
  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 1;
  usuariosPaginados: Usuario[] = [];

  /*
     PAGINACIÓN ROLES
 */
  paginaRoles = 1;
  itemsPorPaginaRoles = 10;
  totalPaginasRoles = 1;
  rolesPaginados: RolView[] = [];

  /*
     DRAWER
 */
  drawerAbierto = false;
  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }

  /*
     LIFECYCLE
  */
  ngOnInit(): void {
    this.rol = localStorage.getItem('rol') || '';

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

    this.cargarUsuarios();
    this.cargarRoles();
    this.cargarPermisos();

    this.rolService.listarRolesBD().subscribe(data => {
      this.rolesBDDisponibles = data;
    });
  }

  /*
     NAVEGACIÓN
  */
  volver(): void { this.router.navigate(['/dashboard']); }
  navegar(ruta: string, _texto: string): void { this.cerrarDrawer(); this.router.navigate([`/${ruta}`]); }
  logout(): void { localStorage.clear(); this.router.navigate(['/login']); }

  cambiarTab(index: number): void {
    this.tabActiva = index;
    this.paginaActual = 1;
    this.paginaRoles = 1;
    this.actualizarPaginacion();
    this.actualizarPaginacionRoles();
  }

  /*
     GENERACIÓN DE USUARIO
  */

  generarNombreUsuario(nombres: string, apellidos: string, idExcluir?: number): string {
    const nombre = this.normalizarTexto(nombres.split(' ')[0]);
    const apellido = this.normalizarTexto(apellidos.split(' ')[0]);
    const base = `${nombre}.${apellido}`;

    // Usuarios existentes con ese prefijo, excluyendo al usuario que se edita
    const existentes = this.usuarios
      .filter(u => u.id !== idExcluir && u.usuario?.startsWith(base))
      .map(u => u.usuario || '');

    if (!existentes.includes(base)) return base;

    let contador = 1;
    while (existentes.includes(`${base}${contador}`)) contador++;
    return `${base}${contador}`;
  }

  private normalizarTexto(texto: string): string {
    return (texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  /** Se llama en tiempo real cuando el usuario escribe nombre/apellido en el modal */
  previewUsuario(): void {
    if (!this.usuarioActual?.nombres || !this.usuarioActual?.apellidos) {
      this.usuarioPreview = '';
      return;
    }
    this.usuarioPreview = this.generarNombreUsuario(
      this.usuarioActual.nombres,
      this.usuarioActual.apellidos,
      this.usuarioActual.id
    );
  }

  /*
     USUARIOS — CARGA
 */
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
          rolNombre: u.roles?.map(r => r.nombreRol).join(', ') || 'Sin rol',
          estado: u.estado,
          fechaRegistro: u.fechaRegistro
        }));
        this.filtrarUsuarios();
        this.cdr.detectChanges();
      },
      error: err => console.error('Error cargando usuarios', err)
    });
  }
  getRolResumido(rolNombre: string | undefined): string {
    if (!rolNombre) return 'Sin rol';
    const roles = rolNombre.split(',').map(r => r.trim());
    if (roles.length <= 1) return rolNombre;

    return `${roles[0]}, ${roles[1].charAt(0)}...`;
  }
  /*
     USUARIOS — MODAL
*/
  abrirModalUsuario(modo: 'crear' | 'editar' | 'ver', u?: Usuario): void {
    this.modoModal = modo;
    this.errorModal = '';
    this.usuarioPreview = '';

    if (modo === 'crear') {
      this.usuarioActual = {
        identidad: '', nombres: '', apellidos: '',
        email: '', telefono: '', usuario: '',
        contrasenia: '', idsRoles: [], estado: 'ACTIVO'
      };
    } else if (u) {
      // Clonar profundamente para no mutar la lista original
      this.usuarioActual = {
        id: u.id,
        identidad: u.identidad ?? '',
        nombres: u.nombres ?? '',
        apellidos: u.apellidos ?? '',
        email: u.email ?? '',
        telefono: u.telefono ?? '',
        usuario: u.usuario ?? '',
        contrasenia: '',
        idsRoles: [...(u.idsRoles ?? [])],
        roles: u.roles ? [...u.roles] : [],
        rolNombre: u.rolNombre ?? '',
        estado: u.estado ?? 'ACTIVO',
        fechaRegistro: u.fechaRegistro
      };
    }

    this.mostrarModalUsuario = true;
    this.cdr.detectChanges();
  }

  cerrarModalUsuario(): void {
    this.mostrarModalUsuario = false;
    this.errorModal = '';
    this.usuarioPreview = '';
    this.cdr.detectChanges();
  }

  toggleRolUsuario(idRol: number): void {
    if (!this.usuarioActual.idsRoles) this.usuarioActual.idsRoles = [];
    const idx = this.usuarioActual.idsRoles.indexOf(idRol);
    if (idx >= 0) this.usuarioActual.idsRoles.splice(idx, 1);
    else this.usuarioActual.idsRoles.push(idRol);
  }

  estaRolSeleccionado(idRol: number): boolean {
    return this.usuarioActual?.idsRoles?.includes(idRol) ?? false;
  }

  /*
     USUARIOS — GUARDAR
  */
  guardarUsuario(): void {
    this.errorModal = '';
    const esCrear = this.modoModal === 'crear';

    // Validaciones de campos
    if (!this.usuarioActual.identidad?.trim()) { this.errorModal = 'La identidad es obligatoria.'; return; }
    if (!this.usuarioActual.nombres?.trim())   { this.errorModal = 'Los nombres son obligatorios.'; return; }
    if (!this.usuarioActual.apellidos?.trim()) { this.errorModal = 'Los apellidos son obligatorios.'; return; }
    if (!this.usuarioActual.email?.trim())     { this.errorModal = 'El email es obligatorio.'; return; }
    if (!this.esEmailValido(this.usuarioActual.email)) { this.errorModal = 'El formato del email no es válido.'; return; }
    if (!this.usuarioActual.idsRoles?.length)  { this.errorModal = 'Selecciona al menos un rol.'; return; }
    if (esCrear && !this.usuarioActual.contrasenia?.trim()) { this.errorModal = 'La contraseña es obligatoria.'; return; }

    // Validar email único
    const emailDuplicado = this.usuarios.some(u =>
      u.email?.toLowerCase() === this.usuarioActual.email?.toLowerCase() &&
      u.id !== this.usuarioActual.id
    );
    if (emailDuplicado) { this.errorModal = 'Ya existe un usuario con ese email.'; return; }

    // Generar nombre de usuario automáticamente
    const usuarioGenerado = this.generarNombreUsuario(
      this.usuarioActual.nombres,
      this.usuarioActual.apellidos,
      this.usuarioActual.id
    );

    const payload: UsuarioRequest = {
      identidad: this.usuarioActual.identidad.trim(),
      nombres: this.usuarioActual.nombres.trim(),
      apellidos: this.usuarioActual.apellidos.trim(),
      email: this.usuarioActual.email.trim(),
      telefono: this.usuarioActual.telefono ?? '',
      contrasenia: this.usuarioActual.contrasenia ?? '',
      usuario: usuarioGenerado,
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
          this.mostrarAlerta('¡Usuario creado!', `El usuario @${usuarioGenerado} fue creado correctamente.`, 'exito');
        },
        error: (err) => {
          this.guardandoUsuario = false;
          const msg: string = err.error?.error || err.error?.message || '';
          if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('correo')) {
            this.errorModal = 'Ya existe un usuario con ese email.';
          } else if (msg.toLowerCase().includes('identidad')) {
            this.errorModal = 'Ya existe un usuario con esa identidad.';
          } else {
            this.errorModal = msg || 'No se pudo crear el usuario.';
          }
          this.cdr.detectChanges();
        }
      });
    } else {
      if (!this.usuarioActual.id) {
        this.guardandoUsuario = false;
        this.errorModal = 'No se encontró el ID del usuario.';
        return;
      }
      this.usuarioService.actualizar(this.usuarioActual.id, payload).subscribe({
        next: () => {
          this.guardandoUsuario = false;
          this.cerrarModalUsuario();
          this.cargarUsuarios();
          this.registrarAuditoria('Actualizar usuario', 'Usuarios');
          this.mostrarAlerta('¡Actualizado!', `El usuario @${usuarioGenerado} fue actualizado.`, 'exito');
        },
        error: (err) => {
          this.guardandoUsuario = false;
          const msg: string = err.error?.error || err.error?.message || '';
          this.errorModal = msg || 'No se pudo actualizar el usuario.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  private esEmailValido(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    this.mostrarAlerta('¿Desactivar usuario?', `¿Desactivar a ${u.nombres} ${u.apellidos}?`, 'confirmar');
  }

  /*
     FILTRADO Y PAGINACIÓN
 */
  filtrarUsuarios(): void {
    const texto = this.busqueda.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(u =>
      (`${u.nombres} ${u.apellidos} ${u.usuario} ${u.identidad}`.toLowerCase().includes(texto)) &&
      (this.filtroEstado === 'Todos' || u.estado?.toUpperCase() === this.filtroEstado.toUpperCase()) &&
      (this.filtroRol === 'Todos' || u.idsRoles?.includes(this.filtroRol as number))
    );
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  actualizarPaginacion(): void {
    this.totalPaginas = Math.max(1, Math.ceil(this.usuariosFiltrados.length / this.itemsPorPagina));
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    this.usuariosPaginados = this.usuariosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
    this.cdr.detectChanges();
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  /*
     ROLES
 */
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
  get rolesActivos(): RolView[] {
    return this.roles.filter(r => r.estado === 'ACTIVO');
  }
  actualizarPaginacionRoles(): void {
    this.totalPaginasRoles = Math.max(1, Math.ceil(this.roles.length / this.itemsPorPaginaRoles));
    const inicio = (this.paginaRoles - 1) * this.itemsPorPaginaRoles;
    this.rolesPaginados = this.roles.slice(inicio, inicio + this.itemsPorPaginaRoles);
    this.cdr.detectChanges();
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
    this.permisosEsquema = {};

    if (modo === 'crear') {
      this.rolActual = {
        nombre: '', descripcion: '',
        fechaCreacion: new Date().toISOString().substring(0, 10)
      };
    } else if (r) {
      this.rolActual = { ...r };
      if (r.id) {
        this.rolService.listar().subscribe({
          next: (data) => {
            const rolActualizado = data.find(x => x.idRol === r.id);
            this.rolesBDSeleccionados = rolActualizado?.rolesBD?.map(rb => rb.nombreRolBd) ?? [];

            // Cargar permisos de esquemas para cada rol BD
            this.permisosEsquema = {};
            (rolActualizado?.rolesBD ?? []).forEach(rolBd => {
              this.rolService.obtenerPermisosEsquemas(rolBd.idRolBd).subscribe({
                next: (permisos: any[]) => {
                  permisos.forEach(p => {
                    this.permisosEsquema[p.nombreEsquema] = {
                      select: p.select,
                      insert: p.insert,
                      update: p.update,
                      delete: p.delete
                    };
                  });
                  this.cdr.detectChanges();
                }
              });
            });

            this.cdr.detectChanges();
          }
        });

        this.rolService.obtenerPermisos(r.id).subscribe({
          next: (ids: number[]) => { this.permisosSeleccionados = ids; this.cdr.detectChanges(); }
        });
      }
    }

    this.cargarRolesBD();
    this.mostrarModalRol = true;
  }
  guardarRol(): void {
    if (!this.rolActual.nombre?.trim()) {
      this.mostrarAlerta('Campo requerido', 'El nombre del rol es obligatorio.', 'error');
      return;
    }

    // ← VALIDACIÓN AQUÍ, ANTES DEL PAYLOAD
    const esquemaSinPermisos = Object.entries(this.permisosEsquema)
      .find(([_, p]) => !p.select && !p.insert && !p.update && !p.delete);

    if (esquemaSinPermisos) {
      this.mostrarAlerta(
        'Permiso requerido',
        `El esquema "${esquemaSinPermisos[0]}" no tiene ningún permiso seleccionado.`,
        'error'
      );
      return;
    }

    const payload: RolRequest = {
      nombreRol: this.rolActual.nombre,
      descripcion: this.rolActual.descripcion,
      permisos: this.permisosSeleccionados,
      rolesBD: this.rolesBDSeleccionados,
      permisosEsquemas: this.rolesBDSeleccionados.flatMap(nombreRolBd => {
        const rolBd = this.rolesBDDisponibles.find(r => r.nombreRolBd === nombreRolBd);
        if (!rolBd || !rolBd.idRolBd) return []; // ← skip si no encuentra
        console.log('rolesBDDisponibles:', this.rolesBDDisponibles);
        console.log('rolesBDSeleccionados:', this.rolesBDSeleccionados);
        return Object.entries(this.permisosEsquema)
          .filter(([_, p]) => p.select || p.insert || p.update || p.delete)
          .map(([esquema, p]) => ({
            idRolBd: rolBd.idRolBd,
            nombreRolBd,
            nombreEsquema: esquema,
            select: p.select,
            insert: p.insert,
            update: p.update,
            delete: p.delete
          }));
      })
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
      error: () => {
        this.guardandoRol = false;
        this.mostrarAlerta('Error', 'No se pudo guardar el rol.', 'error');
      }
    });
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
    this.mostrarAlerta('¿Desactivar rol?', `¿Desactivar el rol "${r.nombre}"?`, 'confirmar');
  }

  cerrarModalRol(): void {
    this.mostrarModalRol = false;
    this.guardandoRol = false;
    this.permisosSeleccionados = [];
    this.rolActual = { nombre: '', descripcion: '', fechaCreacion: '' };
    this.permisosEsquema = {};
    this.cdr.detectChanges();
  }

  cambiarEstadoRol(estado: string): void {
    if (!this.rolActual.id) return;
    this.rolService.cambiarEstado(this.rolActual.id, estado).subscribe({
      next: () => {
        this.rolActual.estado = estado;
        this.cargarRoles();
        this.cdr.detectChanges();
        this.mostrarAlerta(
          estado === 'ACTIVO' ? '¡Rol activado!' : 'Rol desactivado',
          `El rol "${this.rolActual.nombre}" fue ${estado === 'ACTIVO' ? 'activado' : 'desactivado'}.`,
          'exito'
        );
      },
      error: () => this.mostrarAlerta('Error', 'No se pudo cambiar el estado.', 'error')
    });
  }

  /*
     PERMISOS / ROLES BD
  */
  cargarPermisos(): void {
    this.http.get<any[]>('http://localhost:8080/permisos').subscribe({
      next: (data) => { this.permisosDisponibles = data; },
      error: err => console.error('Error cargando permisos', err)
    });
  }

  togglePermiso(idPermiso: number): void {
    const idx = this.permisosSeleccionados.indexOf(idPermiso);
    if (idx >= 0) this.permisosSeleccionados.splice(idx, 1);
    else this.permisosSeleccionados.push(idPermiso);
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
    const idx = this.rolesBDSeleccionados.indexOf(nombre);
    if (idx >= 0) this.rolesBDSeleccionados.splice(idx, 1);
    else this.rolesBDSeleccionados.push(nombre);
  }
  toggleEsquema(esquema: string): void {
    if (this.permisosEsquema[esquema]) {
      delete this.permisosEsquema[esquema];
    } else {
      this.permisosEsquema[esquema] = {
        select: false, insert: false, update: false, delete: false
      };
    }
  }

  esquemaActivo(esquema: string): boolean {
    return !!this.permisosEsquema[esquema];
  }

  get esquemasConfigurados(): string[] {
    return Object.keys(this.permisosEsquema);
  }

  readonly esquemas = [
    'academico', 'inventario', 'laboratorios', 'notificaciones',
    'organizacion', 'public', 'recursos', 'reportes',
    'reservas', 'seguridad', 'seguridad_bd', 'usuarios'
  ];

  permisosEsquema: Record<string, {
    select: boolean; insert: boolean; update: boolean; delete: boolean;
  }> = {};
  /*
     UTILIDADES
*/
  getEstadoClass(estado?: string): string {
    return estado === 'Activo' || estado === 'ACTIVO' ? 'activo' : 'inactivo';
  }

  registrarAuditoria(accion: string, modulo: string): void {
    this.auditorias.unshift({ usuario: 'Sistema', accion, modulo, fecha: new Date().toLocaleString() });
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
    if (this.accionPendiente) { this.accionPendiente(); this.accionPendiente = null; }
    this.cdr.detectChanges();
  }

  get usuariosActivos(): number { return this.usuarios.filter(u => u.estado?.toUpperCase() === 'ACTIVO').length; }
  get usuariosInactivos(): number { return this.usuarios.filter(u => u.estado?.toUpperCase() !== 'ACTIVO').length; }
}
