import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { RolService, RolRequest, RolResponse, RolBD } from '../services/rol.service';

import { RolView } from '../interfaces/Rol.model';
import { Auditoria } from '../interfaces/Auditoria.model';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.html',
  styleUrls: ['./roles.scss']
})
export class RolesComponent implements OnInit {

  constructor(
    private rolService: RolService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  /* == ESTADO GENERAL==*/
  guardandoRol = false;
  mostrarNotificacion = false;
  notificacionTitulo = '';
  notificacionMensaje = '';
  notificacionTipo: 'exito' | 'error' | 'confirmar' = 'exito';
  accionPendiente: (() => void) | null = null;
// Variables nuevas — agregar junto a las demás
  modulosSistema: { idModulo: number, nombre: string, ruta: string, icono: string, esquemasRelacionados: string[] }[] = [];
  modulosSeleccionados: number[] = [];
  esquemasResaltados: string[] = []; // esquemas sugeridos por módulos seleccionados

  mostrarModalRol = false;
  modoModal: 'crear' | 'editar' = 'crear';

  rolActual!: RolView;
  roles: RolView[] = [];
  auditorias: Auditoria[] = [];

  permisosDisponibles: any[] = [];
  permisosSeleccionados: number[] = [];

  rolesBDDisponibles: RolBD[] = [];
  rolesBDSeleccionados: string[] = [];
  rolesBD: string[] = [];
  tabModal = 1;

  esquemas: string[] = [];
  permisosEsquema: Record<string, {
    select: boolean; insert: boolean; update: boolean; delete: boolean;
  }> = {};

  /* PAGINACIÓN */
  paginaRoles = 1;
  itemsPorPaginaRoles = 10;
  totalPaginasRoles = 1;
  rolesPaginados: RolView[] = [];

  /* ==LIFECYCLE==*/
  ngOnInit(): void {
    this.cargarRoles();
    this.cargarPermisos();
    this.cargarEsquemas();
    this.cargarModulos();
    this.rolService.listarRolesBD().subscribe(data => {
      this.rolesBDDisponibles = data;
    });
  }

  /* ==CARGA DE DATOS==*/
  cargarRoles(): void {
    this.rolService.listar().subscribe({
      next: (data: RolResponse[]) => {
        this.roles = data.map(r => ({
          id: r.idRol,
          nombre: r.nombreRol,
          descripcion: r.descripcion,
          fechaCreacion: r.fechaCreacion,
          rolesBD: r.rolesBD ?? [],
          estado: r.estado ?? 'ACTIVO',
          modulosIds: r.modulosIds ?? []
        }));
        this.actualizarPaginacionRoles();
        this.cdr.detectChanges();
      }
    });
  }
  cargarPermisos(): void {
    this.http.get<any[]>('http://localhost:8080/permisos').subscribe({
      next: (data) => { this.permisosDisponibles = data; },
      error: err => console.error('Error cargando permisos', err)
    });
  }

  cargarEsquemas(): void {
    this.http.get<string[]>('http://localhost:8080/roles/esquemas').subscribe({
      next: (data) => { this.esquemas = data; },
      error: err => console.error('Error cargando esquemas', err)
    });
  }

  cargarRolesBD(): void {
    this.http.get<string[]>('http://localhost:8080/roles/roles-bd').subscribe(data => {
      this.rolesBD = data;
    });
  }

  /* ==GETTERS== */
  get esquemasConfigurados(): string[] {
    return Object.keys(this.permisosEsquema);
  }
  get esquemasFiltrados(): string[] {
    if (this.modulosSeleccionados.length === 0) return this.esquemas;
    return this.esquemasResaltados.filter((v, i, a) => a.indexOf(v) === i); // únicos
  }
  /* ==PAGINACIÓN==*/
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

  /* == MODAL ROL== */
  abrirModalRol(modo: 'crear' | 'editar', r?: RolView): void {
    this.modoModal = modo;
    this.permisosSeleccionados = [];
    this.rolesBDSeleccionados = [];
    this.permisosEsquema = {};
    this.modulosSeleccionados = [];
    this.esquemasResaltados = [];
    this.tabModal = 1;

    if (modo === 'crear') {
      this.rolActual = {
        nombre: '', descripcion: '',
        fechaCreacion: new Date().toISOString().substring(0, 10)
      };
    } else if (r) {
      this.rolActual = { ...r };

      this.rolesBDSeleccionados = r.rolesBD?.map(rb => rb.nombreRolBd) ?? [];
      this.modulosSeleccionados = r.modulosIds ?? [];
      this.esquemasResaltados = this.modulosSistema
        .filter(m => this.modulosSeleccionados.includes(m.idModulo))
        .flatMap(m => m.esquemasRelacionados);

      if (r.id) {
        this.permisosEsquema = {};
        (r.rolesBD ?? []).forEach(rolBd => {
          this.rolService.obtenerPermisosEsquemas(rolBd.idRolBd).subscribe({
            next: (permisos: any[]) => {
              permisos.forEach(p => {
                this.permisosEsquema[p.nombreEsquema] = {
                  select: p.select, insert: p.insert,
                  update: p.update, delete: p.delete
                };
              });
              this.cdr.detectChanges();
            }
          });
        });

        this.rolService.obtenerPermisos(r.id).subscribe({
          next: (ids: number[]) => {
            this.permisosSeleccionados = ids;
            this.cdr.detectChanges();
          }
        });
      }
    }

    this.cargarRolesBD();
    this.mostrarModalRol = true;
  }
  cerrarModalRol(): void {
    this.mostrarModalRol = false;
    this.guardandoRol = false;
    this.permisosSeleccionados = [];
    this.rolActual = { nombre: '', descripcion: '', fechaCreacion: '' };
    this.permisosEsquema = {};
    this.modulosSeleccionados = [];
    this.esquemasResaltados = [];
    this.cdr.detectChanges();
  }

  /* == GUARDAR ROL== */
  guardarRol(): void {
    if (!this.rolActual.nombre?.trim()) {
      this.mostrarAlerta('Campo requerido', 'El nombre del rol es obligatorio.', 'error');
      return;
    }

    const esquemaSinPermisos = Object.entries(this.permisosEsquema)
      .find(([_, p]) => !p.select && !p.insert && !p.update && !p.delete);

    if (esquemaSinPermisos) {
      this.mostrarAlerta('Permiso requerido',
        `El esquema "${esquemaSinPermisos[0]}" no tiene ningún permiso seleccionado.`, 'error');
      return;
    }

    const payload: RolRequest = {
      nombreRol: this.rolActual.nombre,
      descripcion: this.rolActual.descripcion,
      permisos: this.permisosSeleccionados,
      rolesBD: this.rolesBDSeleccionados,
      modulosIds: this.modulosSeleccionados,
      permisosEsquemas: this.rolesBDSeleccionados.flatMap(nombreRolBd => {
        const rolBd = this.rolesBDDisponibles.find(r => r.nombreRolBd === nombreRolBd);
        if (!rolBd || !rolBd.idRolBd) return [];
        return Object.entries(this.permisosEsquema)
          .filter(([_, p]) => p.select || p.insert || p.update || p.delete)
          .map(([esquema, p]) => ({
            idRolBd: rolBd.idRolBd, nombreRolBd,
            nombreEsquema: esquema,
            select: p.select, insert: p.insert, update: p.update, delete: p.delete
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
        this.mostrarAlerta('¡Rol guardado!', `El rol "${payload.nombreRol}" fue guardado.`, 'exito');

        // Si editamos el rol actual del usuario → refrescar módulos del dashboard
        const rolActual = localStorage.getItem('rol');
        if (payload.nombreRol === rolActual) {
          // Disparar evento para que el dashboard se actualice
          localStorage.removeItem('modulos');
        }
      }
    });
  }

  toggleEstadoRolTabla(r: RolView): void {
    if (!r.id) return;
    const nuevoEstado = r.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const accion = nuevoEstado === 'ACTIVO' ? 'activar' : 'desactivar';

    this.accionPendiente = () => {
      this.rolService.cambiarEstado(r.id!, nuevoEstado).subscribe({
        next: () => {
          this.cargarRoles();
          this.mostrarAlerta(
            nuevoEstado === 'ACTIVO' ? '¡Rol activado!' : 'Rol desactivado',
            `El rol "${r.nombre}" fue ${nuevoEstado === 'ACTIVO' ? 'activado' : 'desactivado'} correctamente.`,
            'exito'
          );
        },
        error: () => this.mostrarAlerta('Error', 'No se pudo cambiar el estado.', 'error')
      });
    };

    this.mostrarAlerta(
      `¿${nuevoEstado === 'ACTIVO' ? 'Activar' : 'Desactivar'} rol?`,
      `¿Deseas ${accion} el rol "${r.nombre}"?`,
      'confirmar'
    );
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

  /* ==PERMISOS / ROLES BD / ESQUEMAS== */
  togglePermiso(idPermiso: number): void {
    const idx = this.permisosSeleccionados.indexOf(idPermiso);
    if (idx >= 0) this.permisosSeleccionados.splice(idx, 1);
    else this.permisosSeleccionados.push(idPermiso);
  }

  esPermisoSeleccionado(idPermiso: number): boolean {
    return this.permisosSeleccionados.includes(idPermiso);
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
      this.permisosEsquema[esquema] = { select: false, insert: false, update: false, delete: false };
    }
  }

  esquemaActivo(esquema: string): boolean {
    return !!this.permisosEsquema[esquema];
  }

  /* ==UTILIDADES == */
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

  cargarModulos(): void {
    this.http.get<any[]>('http://localhost:8080/roles/modulos').subscribe({
      next: (data) => {
        this.modulosSistema = data.map(m => ({
          idModulo: m.idModulo,
          nombre: m.nombre,
          ruta: m.ruta,
          icono: m.icono,
          esquemasRelacionados: m.esquemasRelacionados ?? []
        }));
        this.cdr.detectChanges();
      }
    });
  }

  toggleModulo(idModulo: number): void {
    const modulo = this.modulosSistema.find(m => m.idModulo === idModulo);
    if (!modulo) return;

    const idx = this.modulosSeleccionados.indexOf(idModulo);
    if (idx >= 0) {
      // Desmarcar módulo → quitar sus esquemas si no los usa otro módulo seleccionado
      this.modulosSeleccionados.splice(idx, 1);
      const esquemasAun = this.modulosSistema
        .filter(m => this.modulosSeleccionados.includes(m.idModulo))
        .flatMap(m => m.esquemasRelacionados);

      modulo.esquemasRelacionados.forEach(esq => {
        if (!esquemasAun.includes(esq)) {
          delete this.permisosEsquema[esq];
        }
      });
    } else {
      // Marcar módulo → activar sus esquemas automáticamente
      this.modulosSeleccionados.push(idModulo);
      modulo.esquemasRelacionados.forEach(esq => {
        if (!this.permisosEsquema[esq]) {
          this.permisosEsquema[esq] = { select: true, insert: false, update: false, delete: false };
        }
      });
    }

    // Actualizar esquemas resaltados
    this.esquemasResaltados = this.modulosSistema
      .filter(m => this.modulosSeleccionados.includes(m.idModulo))
      .flatMap(m => m.esquemasRelacionados);

    this.cdr.detectChanges();
  }

  esModuloSeleccionado(idModulo: number): boolean {
    return this.modulosSeleccionados.includes(idModulo);
  }

  esEsquemaResaltado(esquema: string): boolean {
    return this.esquemasResaltados.includes(esquema);
  }
}
