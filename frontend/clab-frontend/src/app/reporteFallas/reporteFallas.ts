import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReporteFallasService } from '../services/reporte-fallas.service';
import { Laboratorio, Equipo } from '../interfaces/ReporteFallas.model';

export interface EquipoConLab extends Equipo {
  codLaboratorio: number;
  nombreLab: string;
}

@Component({
  selector: 'app-reporte-fallas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './reporteFallas.html',
  styleUrls: ['./reporteFallas.scss']
})
export class ReporteFallasComponent implements OnInit {

  private API_URL = 'http://localhost:8080';

  // ── Forms ──────────────────────────────────────────────
  reporteForm!: FormGroup;
  reporteRapidoForm!: FormGroup;

  // ── Datos base ─────────────────────────────────────────
  laboratorios: Laboratorio[] = [];
  equiposFiltrados: Equipo[] = [];       // select del modal manual
  reportes: any[] = [];                  // todos los reportes del backend

  // ── Tab activa ─────────────────────────────────────────
  tabActivo: 'equipos' | 'reportes' = 'equipos';

  // ── Tab Equipos ────────────────────────────────────────
  todosLosEquipos: EquipoConLab[] = [];
  todosLosEquiposFiltrados: EquipoConLab[] = [];
  filtroTextoEquipos = '';
  filtroCodLabEquipos: number | null = null;
  equiposReportados = 0;

  // Paginación equipos
  paginaEquipos = 1;
  tamPaginaEquipos = 10;

  // ── Tab Reportes ───────────────────────────────────────
  reportesFiltrados: any[] = [];
  filtroTextoReportes = '';
  filtroCodLabReportes: number | null = null;

  // Paginación reportes
  paginaReportes = 1;
  tamPaginaReportes = 10;

  // ── Modales ─────────────────────────────────────────────
  mostrarModal = false;
  mostrarModalReportarEquipo = false;
  equipoSeleccionado: EquipoConLab | null = null;
  mostrarModalDetalle = false;
  reporteDetalle: any = null;
  mostrarModalConfirmar = false;
  idAEliminar: number | null = null;

  // ── Sesión / UI ─────────────────────────────────────────
  drawerAbierto = false;
  rol = sessionStorage.getItem('rol') || '';
  usuarioLogueado = sessionStorage.getItem('usuario') || 'Usuario';
  idUsuario = Number(sessionStorage.getItem('idUsuario'));
  cargando = false;
  mostrarToast = false;
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private reporteService: ReporteFallasService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.rol = sessionStorage.getItem('rol') || '';
    this.usuarioLogueado = sessionStorage.getItem('usuario') || 'Usuario';
    this.idUsuario = Number(sessionStorage.getItem('idUsuario'));
    this.inicializarFormularios();
    this.cargarLaboratorios();
    this.cargarReportesYEquipos();
  }

  // ─────────────────────────────────────────────────────────
  // PAGINACIÓN — EQUIPOS (getter calculado)
  // ─────────────────────────────────────────────────────────
  get equiposPaginados(): EquipoConLab[] {
    const inicio = (this.paginaEquipos - 1) * this.tamPaginaEquipos;
    return this.todosLosEquiposFiltrados.slice(inicio, inicio + this.tamPaginaEquipos);
  }

  get totalPaginasEquipos(): number {
    return Math.max(1, Math.ceil(this.todosLosEquiposFiltrados.length / this.tamPaginaEquipos));
  }

  getPaginasEquipos(): number[] {
    return Array.from({ length: this.totalPaginasEquipos }, (_, i) => i + 1);
  }

  // ─────────────────────────────────────────────────────────
  // PAGINACIÓN — REPORTES (getter calculado)
  // ─────────────────────────────────────────────────────────
  get reportesPaginados(): any[] {
    const inicio = (this.paginaReportes - 1) * this.tamPaginaReportes;
    return this.reportesFiltrados.slice(inicio, inicio + this.tamPaginaReportes);
  }

  get totalPaginasReportes(): number {
    return Math.max(1, Math.ceil(this.reportesFiltrados.length / this.tamPaginaReportes));
  }

  getPaginasReportes(): number[] {
    return Array.from({ length: this.totalPaginasReportes }, (_, i) => i + 1);
  }

  // ─────────────────────────────────────────────────────────
  // TABS
  // ─────────────────────────────────────────────────────────
  cambiarTab(tab: 'equipos' | 'reportes'): void {
    this.tabActivo = tab;
    this.cdr.detectChanges();
  }

  // ─────────────────────────────────────────────────────────
  // INICIALIZACIÓN
  // ─────────────────────────────────────────────────────────
  inicializarFormularios(): void {
    this.reporteForm = this.fb.group({
      codLaboratorio: [null, Validators.required],
      idEquipo: [null, Validators.required],
      descripcionFalla: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
    this.reporteRapidoForm = this.fb.group({
      descripcionFalla: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  // ─────────────────────────────────────────────────────────
  // CARGA DE DATOS
  // ─────────────────────────────────────────────────────────
  cargarLaboratorios(): void {
    this.http.get<Laboratorio[]>(`${this.API_URL}/laboratorios/listar`).subscribe({
      next: (data) => { this.laboratorios = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error cargando laboratorios:', err)
    });
  }

  /**
   * Carga reportes primero, luego equipos.
   * Filtra reportes según rol: Docente solo ve los suyos.
   */
  cargarReportesYEquipos(): void {
    this.reporteService.listar().subscribe({
      next: (data) => {
        this.reportes = data;
        // ── Filtro por rol ──────────────────────────────
        if (this.rol === 'Docente') {
          this.reportesFiltrados = data.filter(r => r.usuario?.idUsuario === this.idUsuario);
        } else {
          // Administradorr y Decano ven todos
          this.reportesFiltrados = [...data];
        }
        this.paginaReportes = 1;
        this.cargarTodosLosEquipos();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al listar reportes:', err);
        this.cargarTodosLosEquipos();
      }
    });
  }

  cargarEquiposPorLaboratorio(codLaboratorio: number): void {
    this.http.get<Equipo[]>(`${this.API_URL}/equipos/porLaboratorio/${codLaboratorio}`).subscribe({
      next: (data) => {
        // Excluir del select los equipos que ya tienen reporte
        const idsReportados = new Set<number>(
          this.reportes.map(r => r.equipo?.idEquipo).filter((id: number) => id != null)
        );
        this.equiposFiltrados = data.filter(eq => !idsReportados.has(eq.idEquipo));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando equipos:', err)
    });
  }

  cargarTodosLosEquipos(): void {
    if (this.laboratorios.length === 0) {
      this.http.get<Laboratorio[]>(`${this.API_URL}/laboratorios/listar`).subscribe({
        next: (labs) => { this.laboratorios = labs; this.fetchEquiposDeTodosLosLabs(labs); },
        error: (err) => console.error('Error:', err)
      });
    } else {
      this.fetchEquiposDeTodosLosLabs(this.laboratorios);
    }
  }

  private fetchEquiposDeTodosLosLabs(labs: Laboratorio[]): void {
    const equiposTemp: EquipoConLab[] = [];
    let pendientes = labs.length;

    if (pendientes === 0) {
      this.aplicarFiltroEquiposSinReporte([]);
      return;
    }

    labs.forEach(lab => {
      this.http.get<Equipo[]>(`${this.API_URL}/equipos/porLaboratorio/${lab.codLaboratorio}`).subscribe({
        next: (equipos) => {
          equipos.forEach(eq => equiposTemp.push({ ...eq, codLaboratorio: lab.codLaboratorio, nombreLab: lab.nombreLab }));
          if (--pendientes === 0) this.aplicarFiltroEquiposSinReporte(equiposTemp);
        },
        error: () => {
          if (--pendientes === 0) this.aplicarFiltroEquiposSinReporte(equiposTemp);
        }
      });
    });
  }

  /**
   * Excluye equipos que ya tienen reporte (sin importar quién lo hizo).
   */
  private aplicarFiltroEquiposSinReporte(equipos: EquipoConLab[]): void {
    const idsReportados = new Set<number>(
      this.reportes.map(r => r.equipo?.idEquipo).filter(id => id != null)
    );
    this.todosLosEquipos = equipos.filter(eq => !idsReportados.has(eq.idEquipo));
    this.equiposReportados = equipos.length - this.todosLosEquipos.length;
    this.todosLosEquiposFiltrados = [...this.todosLosEquipos];
    this.paginaEquipos = 1;
    this.cdr.detectChanges();
  }

  // ─────────────────────────────────────────────────────────
  // FILTROS — TAB EQUIPOS
  // ─────────────────────────────────────────────────────────
  aplicarFiltrosEquipos(): void {
    this.todosLosEquiposFiltrados = this.todosLosEquipos.filter(eq => {
      const textoCoincide = !this.filtroTextoEquipos ||
        eq.nombreEquipo.toLowerCase().includes(this.filtroTextoEquipos.toLowerCase()) ||
        (eq.marca && eq.marca.toLowerCase().includes(this.filtroTextoEquipos.toLowerCase())) ||
        (eq.modelo && eq.modelo.toLowerCase().includes(this.filtroTextoEquipos.toLowerCase()));
      const labCoincide = !this.filtroCodLabEquipos ||
        eq.codLaboratorio === Number(this.filtroCodLabEquipos);
      return textoCoincide && labCoincide;
    });
    this.paginaEquipos = 1;
    this.cdr.detectChanges();
  }

  onFiltroTextoEquiposChange(event: Event): void {
    this.filtroTextoEquipos = (event.target as HTMLInputElement).value;
    this.aplicarFiltrosEquipos();
  }

  onFiltroLabEquiposChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.filtroCodLabEquipos = val ? Number(val) : null;
    this.aplicarFiltrosEquipos();
  }

  // ─────────────────────────────────────────────────────────
  // FILTROS — TAB REPORTES
  // ─────────────────────────────────────────────────────────
  aplicarFiltrosReportes(): void {
    // Base: todos los reportes o solo los del usuario según rol
    const base = this.rol === 'Docente'
      ? this.reportes.filter(r => r.usuario?.idUsuario === this.idUsuario)
      : this.reportes;

    this.reportesFiltrados = base.filter(r => {
      const textoCoincide = !this.filtroTextoReportes ||
        r.equipo?.nombreEquipo?.toLowerCase().includes(this.filtroTextoReportes.toLowerCase()) ||
        r.laboratorio?.nombreLab?.toLowerCase().includes(this.filtroTextoReportes.toLowerCase()) ||
        r.descripcionFalla?.toLowerCase().includes(this.filtroTextoReportes.toLowerCase());
      const labCoincide = !this.filtroCodLabReportes ||
        r.laboratorio?.codLaboratorio === Number(this.filtroCodLabReportes);
      return textoCoincide && labCoincide;
    });
    this.paginaReportes = 1;
    this.cdr.detectChanges();
  }

  onFiltroTextoReportesChange(event: Event): void {
    this.filtroTextoReportes = (event.target as HTMLInputElement).value;
    this.aplicarFiltrosReportes();
  }

  onFiltroLabReportesChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.filtroCodLabReportes = val ? Number(val) : null;
    this.aplicarFiltrosReportes();
  }

  // ─────────────────────────────────────────────────────────
  // MODAL — REPORTE MANUAL
  // ─────────────────────────────────────────────────────────
  onLaboratorioChange(): void {
    const cod = this.reporteForm.get('codLaboratorio')?.value;
    if (cod) {
      this.cargarEquiposPorLaboratorio(Number(cod));
      this.reporteForm.patchValue({ idEquipo: null });
    } else {
      this.equiposFiltrados = [];
    }
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.reporteForm.reset({ codLaboratorio: null, idEquipo: null, descripcionFalla: '' });
    this.equiposFiltrados = [];
  }

  cerrarModal(): void {
    setTimeout(() => {
      this.mostrarModal = false;
      this.reporteForm.reset();
      this.equiposFiltrados = [];
      this.cdr.detectChanges();
    }, 100);
  }

  guardarReporte(): void {
    if (this.reporteForm.invalid) { this.reporteForm.markAllAsTouched(); return; }
    this.cargando = true;
    const dto = {
      codLaboratorio: Number(this.reporteForm.get('codLaboratorio')?.value),
      idEquipo: Number(this.reporteForm.get('idEquipo')?.value),
      descripcionFalla: this.reporteForm.get('descripcionFalla')?.value,
      idUsuario: this.idUsuario
    };
    this.reporteService.crear(dto).subscribe({
      next: () => {
        this.mostrarNotificacion('✅ Reporte creado correctamente');
        this.cerrarModal();
        this.cargarReportesYEquipos();
        this.cargando = false;
      },
      error: () => { this.mostrarNotificacion('❌ Error al crear el reporte', 'error'); this.cargando = false; }
    });
  }

  // ─────────────────────────────────────────────────────────
  // MODAL — REPORTE RÁPIDO DESDE FILA
  // ─────────────────────────────────────────────────────────
  abrirModalReportarEquipo(equipo: EquipoConLab): void {
    this.equipoSeleccionado = equipo;
    this.reporteRapidoForm.reset({ descripcionFalla: '' });
    this.mostrarModalReportarEquipo = true;
    this.cdr.detectChanges();
  }

  cerrarModalReportarEquipo(): void {
    this.mostrarModalReportarEquipo = false;
    this.equipoSeleccionado = null;
    this.reporteRapidoForm.reset();
    this.cdr.detectChanges();
  }

  guardarReporteRapido(): void {
    if (this.reporteRapidoForm.invalid || !this.equipoSeleccionado) { this.reporteRapidoForm.markAllAsTouched(); return; }
    this.cargando = true;
    const dto = {
      codLaboratorio: this.equipoSeleccionado.codLaboratorio,
      idEquipo: this.equipoSeleccionado.idEquipo,
      descripcionFalla: this.reporteRapidoForm.get('descripcionFalla')?.value,
      idUsuario: this.idUsuario
    };
    this.reporteService.crear(dto).subscribe({
      next: () => {
        this.mostrarNotificacion('✅ Reporte enviado correctamente');
        this.cerrarModalReportarEquipo();
        this.cargarReportesYEquipos();
        this.cargando = false;
      },
      error: () => { this.mostrarNotificacion('❌ Error al enviar el reporte', 'error'); this.cargando = false; }
    });
  }

  // ─────────────────────────────────────────────────────────
  // MODAL — VER DETALLE
  // ─────────────────────────────────────────────────────────
  verDetalle(reporte: any): void {
    this.reporteDetalle = reporte;
    this.mostrarModalDetalle = true;
    this.cdr.detectChanges();
  }

  cerrarDetalle(): void {
    this.mostrarModalDetalle = false;
    this.reporteDetalle = null;
    this.cdr.detectChanges();
  }

  // ─────────────────────────────────────────────────────────
  // MODAL — CONFIRMAR ELIMINAR (solo Admin / Decano)
  // ─────────────────────────────────────────────────────────
  confirmarEliminar(id: number): void {
    this.idAEliminar = id;
    this.mostrarModalConfirmar = true;
    this.cdr.detectChanges();
  }

  cancelarEliminar(): void {
    this.idAEliminar = null;
    this.mostrarModalConfirmar = false;
    this.cdr.detectChanges();
  }

  ejecutarEliminar(): void {
    if (!this.idAEliminar) return;
    this.mostrarModalConfirmar = false;
    this.reporteService.eliminar(this.idAEliminar).subscribe({
      next: () => {
        this.mostrarNotificacion('✅ Reporte eliminado correctamente');
        this.cargarReportesYEquipos();   // el equipo vuelve a aparecer en la tabla
        this.idAEliminar = null;
      },
      error: () => { this.mostrarNotificacion('❌ Error al eliminar el reporte', 'error'); this.idAEliminar = null; }
    });
  }

  // ─────────────────────────────────────────────────────────
  // UTILS
  // ─────────────────────────────────────────────────────────
  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    this.ngZone.run(() => {
      this.toastMensaje = mensaje;
      this.toastTipo = tipo;
      this.mostrarToast = true;
      this.cdr.detectChanges();
      setTimeout(() => { this.mostrarToast = false; this.cdr.detectChanges(); }, 3000);
    });
  }

  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }
  navegar(ruta: string, _texto: string): void { this.cerrarDrawer(); this.router.navigate([`/${ruta}`]); }
  logout(): void { sessionStorage.clear(); this.router.navigate(['/login']); }
  volver(): void { this.router.navigate(['/dashboard']); }
  formatearFecha(fecha: any): string { if (!fecha) return ''; return new Date(fecha).toLocaleDateString('es-ES'); }
}
