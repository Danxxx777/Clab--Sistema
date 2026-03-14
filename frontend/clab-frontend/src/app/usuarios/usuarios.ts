import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { RolService, RolResponse } from '../services/rol.service';
import { UsuarioService, UsuarioRequest, UsuarioResponse } from '../services/usuario.service';

import { Usuario } from '../interfaces/Usuario.model';
import { RolView } from '../interfaces/Rol.model';
import { Auditoria } from '../interfaces/Auditoria.model';

import { RolesComponent } from '../roles/roles';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RolesComponent],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss']
})
export class UsuariosComponent implements OnInit {

  constructor(
    private router: Router,
    private rolService: RolService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  /* ==ESTADO GENERAL== */
  guardandoUsuario = false;
  mostrarNotificacion = false;
  notificacionTitulo = '';
  notificacionMensaje = '';
  notificacionTipo: 'exito' | 'error' | 'confirmar' = 'exito';
  accionPendiente: (() => void) | null = null;
  errorModal = '';

  tabActiva = 0;
  mostrarModalUsuario = false;
  modoModal: 'crear' | 'editar' | 'ver' = 'crear';

  usuarioActual!: Usuario;
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  roles: RolView[] = [];
  auditorias: Auditoria[] = [];

  busqueda = '';
  filtroEstado = 'Todos';
  filtroRol: number | 'Todos' = 'Todos';

  usuarioLogueado = '';
  rol = '';
  usuarioPreview = '';

  /* PAGINACIÓN */
  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 1;
  usuariosPaginados: Usuario[] = [];

  /* DRAWER */
  drawerAbierto = false;
  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }

  /* ==LIFECYCLE== */
  ngOnInit(): void {
    this.rol = sessionStorage.getItem('rol') || '';

    const userData = sessionStorage.getItem('usuario') || sessionStorage.getItem('user');
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
  }

  /* ==NAVEGACIÓN== */
  volver(): void { this.router.navigate(['/dashboard']); }
  navegar(ruta: string, _texto: string): void { this.cerrarDrawer(); this.router.navigate([`/${ruta}`]); }
  logout(): void { sessionStorage.clear(); this.router.navigate(['/login']); }

  cambiarTab(index: number): void {
    this.tabActiva = index;
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  /* ==GENERACIÓN DE USUARIO== */
  generarNombreUsuario(nombres: string, apellidos: string, idExcluir?: number): string {
    const nombre = this.normalizarTexto(nombres.split(' ')[0]);
    const apellido = this.normalizarTexto(apellidos.split(' ')[0]);
    const base = `${nombre}.${apellido}`;

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

  /* ==CARGA DE DATOS== */
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
          rolNombre: u.rol || u.roles?.map(r => r.nombreRol).join(', ') || 'Sin rol',
          estado: u.estado,
          fechaRegistro: u.fechaRegistro
        }));
        this.filtrarUsuarios();
        this.cdr.detectChanges();
      },
      error: err => console.error('Error cargando usuarios', err)
    });
  }

  // Solo para el dropdown de filtro
  cargarRoles(): void {
    this.rolService.listar().subscribe({
      next: (data: RolResponse[]) => {
        this.roles = data
          .filter(r => r.estado === 'ACTIVO')
          .map(r => ({
            id: r.idRol,
            nombre: r.nombreRol,
            descripcion: r.descripcion,
            fechaCreacion: r.fechaCreacion,
            rolesBD: r.rolesBD ?? [],
            estado: r.estado ?? 'ACTIVO'
          }));
        this.cdr.detectChanges();
      }
    });
  }

  getRolResumido(rolNombre: string | undefined): string {
    if (!rolNombre) return 'Sin rol';
    const roles = rolNombre.split(',').map(r => r.trim());
    if (roles.length <= 1) return rolNombre;
    const primero = roles[0];
    const segundo = roles[1].charAt(0) + '..';
    return `${primero}, ${segundo}`;
  }
  /* ==GETTERS== */
  get rolesActivos(): RolView[] {
    return this.roles.filter(r => r.estado === 'ACTIVO');
  }

  get usuariosActivos(): number { return this.usuarios.filter(u => u.estado?.toUpperCase() === 'ACTIVO').length; }
  get usuariosInactivos(): number { return this.usuarios.filter(u => u.estado?.toUpperCase() !== 'ACTIVO').length; }

  /* ==MODAL USUARIO== */
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

  /* ==GUARDAR USUARIO== */
  guardarUsuario(): void {
    this.errorModal = '';
    const esCrear = this.modoModal === 'crear';

    // Campos obligatorios
    if (!this.usuarioActual.identidad?.trim()) { this.errorModal = 'La identidad es obligatoria.'; return; }
    if (!this.usuarioActual.nombres?.trim())   { this.errorModal = 'Los nombres son obligatorios.'; return; }
    if (!this.usuarioActual.apellidos?.trim()) { this.errorModal = 'Los apellidos son obligatorios.'; return; }
    if (!this.usuarioActual.email?.trim())     { this.errorModal = 'El email es obligatorio.'; return; }

    // Validar identidad: 10 dígitos (cédula) o 13 (RUC)
    if (!/^\d{10}(\d{3})?$/.test(this.usuarioActual.identidad.trim())) {
      this.errorModal = 'La identidad debe tener 10 dígitos (cédula) o 13 (RUC).'; return;
    }

    // Validar nombres y apellidos: solo letras, tildes, ñ y espacios
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(this.usuarioActual.nombres.trim())) {
      this.errorModal = 'Los nombres solo deben contener letras.'; return;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(this.usuarioActual.apellidos.trim())) {
      this.errorModal = 'Los apellidos solo deben contener letras.'; return;
    }

    // Validar email
    if (!this.esEmailValido(this.usuarioActual.email)) { this.errorModal = 'El formato del email no es válido.'; return; }

    // Validar teléfono (opcional, pero si se ingresó debe ser válido)
    if (this.usuarioActual.telefono?.trim()) {
      if (!/^\+?[0-9]{7,15}$/.test(this.usuarioActual.telefono.trim())) {
        this.errorModal = 'El teléfono no tiene un formato válido.'; return;
      }
    }

    /* Validar contraseña mínima al crear
    if (esCrear && !this.usuarioActual.contrasenia?.trim()) { this.errorModal = 'La contraseña es obligatoria.'; return; }
    if (esCrear && this.usuarioActual.contrasenia!.trim().length < 8) {
      this.errorModal = 'La contraseña debe tener al menos 8 caracteres.'; return;
    }*/

    // Validar roles
    if (!this.usuarioActual.idsRoles?.length) { this.errorModal = 'Selecciona al menos un rol.'; return; }

    // Validar email duplicado
    const emailDuplicado = this.usuarios.some(u =>
      u.email?.toLowerCase() === this.usuarioActual.email?.toLowerCase() &&
      u.id !== this.usuarioActual.id
    );
    if (emailDuplicado) { this.errorModal = 'Ya existe un usuario con ese email.'; return; }

    const usuarioGenerado = this.modoModal === 'crear'
      ? this.generarNombreUsuario(this.usuarioActual.nombres, this.usuarioActual.apellidos)
      : this.usuarioActual.usuario;

    const payload: UsuarioRequest = {
      identidad:  this.usuarioActual.identidad.trim(),
      nombres:    this.usuarioActual.nombres.trim(),
      apellidos:  this.usuarioActual.apellidos.trim(),
      email:      this.usuarioActual.email.trim(),
      telefono:   this.usuarioActual.telefono?.trim() ?? '',
      // contrasenia: this.usuarioActual.contrasenia ?? '',  ← ELIMINA ESTA LÍNEA
      usuario:    usuarioGenerado,
      idsRoles:   this.usuarioActual.idsRoles ?? []
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

  toggleEstadoUsuario(u: Usuario): void {
    if (!u.id) return;
    const nuevoEstado = u.estado?.toUpperCase() === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const accion = nuevoEstado === 'ACTIVO' ? 'activar' : 'desactivar';

    this.accionPendiente = () => {
      const request$ = nuevoEstado === 'ACTIVO'
        ? this.usuarioService.activar(u.id!)
        : this.usuarioService.desactivar(u.id!);

      request$.subscribe({
        next: () => {
          this.cargarUsuarios();
          this.registrarAuditoria(`${nuevoEstado === 'ACTIVO' ? 'Activar' : 'Desactivar'} usuario`, 'Usuarios');
          this.mostrarAlerta(
            nuevoEstado === 'ACTIVO' ? '¡Usuario activado!' : 'Usuario desactivado',
            `${u.nombres} ${u.apellidos} fue ${nuevoEstado === 'ACTIVO' ? 'activado' : 'desactivado'} correctamente.`,
            'exito'
          );
        },
        error: () => this.mostrarAlerta('Error', 'No se pudo cambiar el estado.', 'error')
      });
    };

    this.mostrarAlerta(
      `¿${nuevoEstado === 'ACTIVO' ? 'Activar' : 'Desactivar'} usuario?`,
      `¿Deseas ${accion} a ${u.nombres} ${u.apellidos}?`,
      'confirmar'
    );
  }

  /* ==FILTRADO Y PAGINACIÓN== */
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

  /* ==UTILIDADES== */
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

    if (tipo !== 'confirmar') {
      setTimeout(() => {
        this.mostrarNotificacion = false;
        this.cdr.detectChanges();
      }, 3000);
    }
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
  soloLetras(event: KeyboardEvent): void {
    const char = event.key;
    // Permite letras (incluyendo tildes y ñ), espacios y teclas de control
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/.test(char)) {
      event.preventDefault();
    }
  }

  soloTelefono(event: KeyboardEvent): void {
    const char = event.key;
    // Permite números y + (para código de país)
    if (!/^[0-9+]$/.test(char)) {
      event.preventDefault();
    }
  }

}
