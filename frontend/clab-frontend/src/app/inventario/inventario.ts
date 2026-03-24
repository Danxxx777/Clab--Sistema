import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { EquipoService, EquipoDTO } from '../services/equipo.service';
import { TipoEquipoService } from '../services/tipo-equipo.service';
import { LaboratorioService, Laboratorio } from '../services/laboratorio.service';
import { Equipo, TipoEquipo } from '../interfaces/Equipo.model';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrls: ['./inventario.scss']
})
export class InventarioComponent implements OnInit {

  tabActiva: 'equipos' | 'tipos' = 'equipos';
  drawerAbierto = false;
  rol = localStorage.getItem('rol') || '';
  usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';

  equipos: Equipo[] = [];
  equiposFiltrados: Equipo[] = [];
  busquedaEquipos = '';

  tiposEquipo: TipoEquipo[] = [];
  tiposFiltrados: TipoEquipo[] = [];
  busquedaTipos = '';

  laboratorios: Laboratorio[] = [];

  mostrarModalEquipo = false;
  modoEdicionEquipo = false;
  idEditando: number | null = null;

  mostrarDetalleEquipo = false;
  equipoDetalle!: Equipo;

  mostrarToast = false;
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';

  // ── MODAL CONFIRMACIÓN ──────────────────────────────────────
  mostrarModalConfirm = false;
  confirmTitulo = '';
  confirmMensaje = '';
  confirmAccion: (() => void) | null = null;

  formEquipo: Equipo = this.nuevoFormulario();

  mostrarModalTipo = false;
  modoEdicionTipo = false;
  idTipoEditando: number | null = null;
  formularioTipo = { nombre: '', descripcion: '' };

  constructor(
    private router: Router,
    private equipoService: EquipoService,
    private tipoEquipoService: TipoEquipoService,
    private laboratorioService: LaboratorioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.rol = localStorage.getItem('rol') || '';
    this.usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';
    this.cargarEquipos();
    this.cargarTipos();
    this.cargarLaboratorios();
  }

  // ── CARGA DE DATOS ──────────────────────────────────────────

  cargarEquipos(): void {
    this.equipoService.listar().subscribe({
      next: (data) => {
        this.equipos = data
          .filter(e => e.estado !== 'INACTIVO' && e.estado !== 'ELIMINADO')  // ✅ ocultar inactivos
          .map(e => ({
            id: e.idEquipo,
            noSerie: e.numeroSerie,
            nombre: e.nombreEquipo,
            marca: e.marca,
            modelo: e.modelo,
            idTipoEquipo: e.tipoEquipo.idTipoEquipo,
            nombreTipoEquipo: e.tipoEquipo.nombreTipo,
            codLaboratorio: e.laboratorio.codLaboratorio,
            nombreLaboratorio: e.laboratorio.nombreLab,
            estado: e.estado,
            fechaAdquisicion: e.fechaAdquisicion,
            ubicacionFisica: e.ubicacionFisica
          }));
        this.equiposFiltrados = [...this.equipos];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando equipos:', err);
        this.mostrarNotificacion('Error al cargar equipos', 'error');
      }
    });
  }

  cargarTipos(): void {
    this.tipoEquipoService.listar().subscribe({
      next: (data) => {
        this.tiposEquipo = data.map(t => ({
          id: t.idTipoEquipo,
          nombre: t.nombreTipo,
          descripcion: t.descripcion
        }));
        this.tiposFiltrados = [...this.tiposEquipo];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando tipos:', err);
        this.mostrarNotificacion('Error al cargar tipos', 'error');
      }
    });
  }

  cargarLaboratorios(): void {
    this.laboratorioService.listar().subscribe({
      next: data => { this.laboratorios = data; },
      error: err => console.error('Error cargando laboratorios', err)
    });
  }

  // ── TOAST ───────────────────────────────────────────────────

  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.mostrarToast = true;
    setTimeout(() => {
      this.mostrarToast = false;
      this.cdr.detectChanges();
    }, 2500);
  }

  // ── MODAL CONFIRMACIÓN ──────────────────────────────────────

  abrirConfirm(titulo: string, mensaje: string, accion: () => void): void {
    this.confirmTitulo = titulo;
    this.confirmMensaje = mensaje;
    this.confirmAccion = accion;
    this.mostrarModalConfirm = true;
  }

  cerrarConfirm(): void {
    this.mostrarModalConfirm = false;
    this.confirmAccion = null;
  }

  ejecutarConfirm(): void {
    if (this.confirmAccion) this.confirmAccion();
    this.cerrarConfirm();
  }

  // ── FILTROS ─────────────────────────────────────────────────

  filtrarEquipos(): void {
    const b = this.busquedaEquipos.toLowerCase();
    this.equiposFiltrados = this.equipos.filter(e =>
      e.noSerie.toLowerCase().includes(b) ||
      e.nombre.toLowerCase().includes(b) ||
      e.nombreTipoEquipo.toLowerCase().includes(b) ||
      e.nombreLaboratorio.toLowerCase().includes(b)
    );
    this.paginaActualEquipos = 1;
  }

  filtrarTipos(): void {
    const b = this.busquedaTipos.toLowerCase();
    this.tiposFiltrados = this.tiposEquipo.filter(t =>
      t.nombre.toLowerCase().includes(b)
    );
    this.paginaActualTipos = 1;
  }

  mostrarDetalleTipo = false;
  tipoDetalle: TipoEquipo | null = null;

  verTipo(tipo: TipoEquipo): void {
    this.tipoDetalle = { ...tipo };
    this.mostrarDetalleTipo = true;
  }

  cerrarDetalleTipo(): void {
    this.mostrarDetalleTipo = false;
    this.tipoDetalle = null;
  }

  // ── EQUIPOS CRUD ────────────────────────────────────────────

  abrirModalEquipo(): void {
    this.modoEdicionEquipo = false;
    this.idEditando = null;
    this.formEquipo = this.nuevoFormulario();
    this.mostrarModalEquipo = true;
  }

  editarEquipo(e: Equipo): void {
    this.modoEdicionEquipo = true;
    this.idEditando = e.id;
    this.formEquipo = { ...e };
    this.mostrarModalEquipo = true;
  }

  verEquipo(e: Equipo): void {
    this.equipoDetalle = { ...e };
    this.mostrarDetalleEquipo = true;
  }

  guardarEquipo(): void {
    const f = this.formEquipo;

    // ✅ Validaciones
    if (!f.noSerie?.trim()) {
      this.mostrarNotificacion('El número de serie es obligatorio', 'error'); return;
    }
    if (!/^[a-zA-Z0-9\-]+$/.test(f.noSerie)) {
      this.mostrarNotificacion('El número de serie solo puede contener letras, números y guiones', 'error');
      return;
    }
    if (!f.nombre?.trim()) {
      this.mostrarNotificacion('El nombre es obligatorio', 'error'); return;
    }
    if (!f.marca?.trim()) {
      this.mostrarNotificacion('La marca es obligatoria', 'error'); return;
    }
    if (!f.modelo?.trim()) {
      this.mostrarNotificacion('El modelo es obligatorio', 'error'); return;
    }
    if (!f.idTipoEquipo || f.idTipoEquipo === 0) {
      this.mostrarNotificacion('Seleccione un tipo de equipo', 'error'); return;
    }
    if (!f.codLaboratorio || f.codLaboratorio === 0) {
      this.mostrarNotificacion('Seleccione un laboratorio', 'error'); return;
    }
    if (!f.fechaAdquisicion) {
      this.mostrarNotificacion('La fecha de adquisición es obligatoria', 'error'); return;
    }
    if (!f.ubicacionFisica?.trim()) {
      this.mostrarNotificacion('La ubicación física es obligatoria', 'error'); return;
    }

    const dto: EquipoDTO = {
      numeroSerie: f.noSerie,
      nombreEquipo: f.nombre,
      marca: f.marca,
      modelo: f.modelo,
      idTipoEquipo: f.idTipoEquipo,
      codLaboratorio: f.codLaboratorio,
      estado: f.estado,
      ubicacionFisica: f.ubicacionFisica,
      fechaAdquisicion: f.fechaAdquisicion
    };

    if (this.modoEdicionEquipo && this.idEditando) {
      this.equipoService.editar(this.idEditando, dto).subscribe({
        next: () => {
          this.cargarEquipos();
          this.cerrarModalEquipo();
          this.mostrarNotificacion('✅ Equipo actualizado correctamente');
        },
        error: (err) => {
          console.error('Error editando equipo:', err);
          this.mostrarNotificacion('Error al actualizar equipo', 'error');
        }
      });
      return;
    }

    this.equipoService.crear(dto).subscribe({
      next: () => {
        this.cargarEquipos();
        this.cerrarModalEquipo();
        this.mostrarNotificacion('✅ Equipo creado correctamente');
      },
      error: (err) => {
        console.error('Error creando equipo:', err);
        this.mostrarNotificacion('Error al crear equipo', 'error');
      }
    });
  }

  eliminarEquipo(e: Equipo): void {
    this.abrirConfirm(
      '¿Eliminar equipo?',
      `¿Estás seguro de eliminar el equipo "${e.nombre}" (${e.noSerie})?`,
      () => {
        this.equipoService.eliminar(e.id).subscribe({
          next: () => {
            this.cargarEquipos();
            this.mostrarNotificacion('🗑️ Equipo eliminado correctamente');
          },
          error: (err) => {
            console.error('Error eliminando equipo:', err);
            this.mostrarNotificacion('Error al eliminar equipo', 'error');
          }
        });
      }
    );
  }

  cerrarModalEquipo(): void { this.mostrarModalEquipo = false; }
  cerrarDetalleEquipo(): void { this.mostrarDetalleEquipo = false; }

  // ── TIPOS CRUD ──────────────────────────────────────────────

  abrirModalTipo(): void {
    this.modoEdicionTipo = false;
    this.idTipoEditando = null;
    this.formularioTipo = { nombre: '', descripcion: '' };
    this.mostrarModalTipo = true;
  }

  editarTipo(tipo: TipoEquipo): void {
    this.modoEdicionTipo = true;
    this.idTipoEditando = tipo.id;
    this.formularioTipo = { nombre: tipo.nombre, descripcion: tipo.descripcion || '' };
    this.mostrarModalTipo = true;
  }

  guardarTipo(): void {
    if (!this.formularioTipo.nombre?.trim()) {
      this.mostrarNotificacion('El nombre del tipo es obligatorio', 'error');
      return;
    }

    // ✅ El backend espera nombreTipo no nombre
    const payload = {
      nombre: this.formularioTipo.nombre,
      descripcion: this.formularioTipo.descripcion || ''
    };

    if (this.modoEdicionTipo && this.idTipoEditando) {
      this.tipoEquipoService.actualizar(this.idTipoEditando, payload).subscribe({
        next: () => {
          this.cargarTipos();
          this.cerrarModalTipo();
          this.mostrarNotificacion('✅ Tipo de equipo actualizado');
        },
        error: (err) => {
          console.error('Error actualizando tipo:', err);
          this.mostrarNotificacion('Error al actualizar tipo', 'error');
        }
      });
      return;
    }

    this.tipoEquipoService.crear(payload).subscribe({
      next: () => {
        this.cargarTipos();
        this.cerrarModalTipo();
        this.mostrarNotificacion('✅ Tipo de equipo creado');
      },
      error: (err) => {
        console.error('Error creando tipo:', err);
        this.mostrarNotificacion('Error al crear tipo', 'error');
      }
    });
  }

  eliminarTipo(t: TipoEquipo): void {
    this.abrirConfirm(
      '¿Eliminar tipo de equipo?',
      `¿Estás seguro de eliminar el tipo "${t.nombre}"? Esta acción no se puede deshacer.`,
      () => {
        this.tipoEquipoService.eliminar(t.id).subscribe({
          next: () => {
            this.cargarTipos();
            this.mostrarNotificacion('🗑️ Tipo de equipo eliminado');
          },
          error: (err) => {
            console.error('Error eliminando tipo:', err);
            this.mostrarNotificacion('Error al eliminar tipo', 'error');
          }
        });
      }
    );
  }

  cerrarModalTipo(): void { this.mostrarModalTipo = false; }


  // ── NAVEGACIÓN ──────────────────────────────────────────────

  cambiarTab(tab: 'equipos' | 'tipos'): void { this.tabActiva = tab; }
  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }
  navegar(ruta: string, texto: string): void {
    this.cerrarDrawer();
    this.router.navigate([`/${ruta}`]);
  }
  logout(): void { localStorage.clear(); this.router.navigate(['/login']); }
  volver(): void { this.router.navigate(['/dashboard']); }

  nuevoFormulario(): Equipo {
    return {
      id: 0,
      noSerie: '',
      nombre: '',
      marca: '',
      modelo: '',
      idTipoEquipo: 0,
      nombreTipoEquipo: '',
      codLaboratorio: 0,
      nombreLaboratorio: '',
      estado: 'OPERATIVO',
      fechaAdquisicion: '',
      ubicacionFisica: ''
    };
  }

  // ══ PAGINACIÓN EQUIPOS ═══════════════════════════════════════
  paginaActualEquipos = 1;
  itemsPorPaginaEquipos = 6;

  get totalPaginasEquipos(): number {
    return Math.ceil(this.equiposFiltrados.length / this.itemsPorPaginaEquipos);
  }

  get equiposPaginados(): Equipo[] {
    const i = (this.paginaActualEquipos - 1) * this.itemsPorPaginaEquipos;
    return this.equiposFiltrados.slice(i, i + this.itemsPorPaginaEquipos);
  }

  get paginasEquipos(): number[] {
    return Array.from({ length: this.totalPaginasEquipos }, (_, i) => i + 1);
  }

  cambiarPaginaEquipos(p: number): void {
    if (p >= 1 && p <= this.totalPaginasEquipos) {
      this.paginaActualEquipos = p;
      this.cdr.detectChanges();
    }
  }

// ══ PAGINACIÓN TIPOS ═════════════════════════════════════════
  paginaActualTipos = 1;
  itemsPorPaginaTipos = 6;

  get totalPaginasTiposEquipo(): number {
    return Math.ceil(this.tiposFiltrados.length / this.itemsPorPaginaTipos);
  }

  get tiposPaginados(): TipoEquipo[] {
    const i = (this.paginaActualTipos - 1) * this.itemsPorPaginaTipos;
    return this.tiposFiltrados.slice(i, i + this.itemsPorPaginaTipos);
  }

  get paginasTiposEquipo(): number[] {
    return Array.from({ length: this.totalPaginasTiposEquipo }, (_, i) => i + 1);
  }

  cambiarPaginaTipos(p: number): void {
    if (p >= 1 && p <= this.totalPaginasTiposEquipo) {
      this.paginaActualTipos = p;
      this.cdr.detectChanges();
    }
  }

  limpiarSerie(): void {
    this.formEquipo.noSerie = this.formEquipo.noSerie.replace(/[^a-zA-Z0-9\-]/g, '');
  }
}
