import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Laboratorio, ModuloConfig, StatModulo, DatoGrafica } from '../interfaces/Reportar.model';
import { ReportarService } from '../services/reportar.service';
import { ExportPdfService } from '../services/export-pdf.service';
import { ExportExcelService } from '../services/export-excel.service';
import {
  ReporteEquipoItem,
  ReporteUsoItem,
  ReporteFallaItem,
  ReporteUsuarioItem,
  ReporteReservaItem,
  ReporteAsistenciaItem,
  ReporteAcademicoItem,
  ReporteBloqueosItem,
} from '../interfaces/Reportar.model';

@Component({
  selector: 'app-reportar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportar.html',
  styleUrls: ['./reportar.scss']
})
export class ReportarComponent implements OnInit {
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private reportarService: ReportarService,
    private exportPdf: ExportPdfService,
    private exportExcel: ExportExcelService,
  ) {}

  // ─── ESTADO GENERAL ────────────────────────────────────────────────────────
  usuarioLogueado = '';
  rol = '';
  drawerAbierto = false;
  temaOscuro   = true;
  colorHeader  = '#1e3a8a';
  colorAcento  = '#3b82f6';
  colorFondo   = '#111111';
  moduloActivo: number | null = null;
  busquedaRealizada = false;
  mostrarEstadisticas = false;
  cargando = false;
  excelPanelAbierto = false;
  incluirGraficas = true;

  // ─── MÓDULOS ───────────────────────────────────────────────────────────────
  modulos: ModuloConfig[] = [
    { id: 'uso',        titulo: 'Uso de Labs',  desc: 'Frecuencia y ocupación de laboratorios', icono: '/laboratorio.png', color: 'neon',     colorHex: '#39ff14' },
    { id: 'equipos',    titulo: 'Equipos',      desc: 'Inventario y estado general',            icono: '/equipo.png',      color: 'verde',    colorHex: '#10b981' },
    { id: 'fallas',     titulo: 'Fallas',       desc: 'Historial y seguimiento de fallas',      icono: '/fallas.png',      color: 'rojo',     colorHex: '#e74c3c' },
    { id: 'usuarios',   titulo: 'Usuarios',     desc: 'Actividad y roles del sistema',          icono: '/user.png',        color: 'azul',     colorHex: '#3b82f6' },
    { id: 'reservas',   titulo: 'Reservas',     desc: 'Historial de reservas de laboratorios',  icono: '/calendario.png',  color: 'naranja',  colorHex: '#e67e22' },
    { id: 'academico',  titulo: 'Académico',    desc: 'Períodos, carreras y asignaturas',       icono: '/academico.png',   color: 'amarillo', colorHex: '#f59e0b' },
    { id: 'bloqueos',   titulo: 'Bloqueos',     desc: 'Bloqueos y restricciones de acceso',     icono: '/bloqueos.png',    color: 'morado',   colorHex: '#a855f7' },
  ];

  // ─── RESUMEN GLOBAL ────────────────────────────────────────────────────────
  resumenGlobal = { reservas: 0, asistencias: 0, fallas: 0, estudiantes: 0, equipos: 0, bloqueos: 0 };

  // ─── FILTROS ───────────────────────────────────────────────────────────────
  laboratorios: Laboratorio[] = [];
  usuarios: { idUsuario: number; nombreCompleto: string }[] = [];
  filtros = { fechaInicio: '', fechaFin: '', laboratorio: '', estado: '', idUsuario: '' };

  // ─── DATOS REPORTE ─────────────────────────────────────────────────────────
  datosReporte: any[] = [];
  statsModulo: StatModulo[] = [];
  datosGrafica: DatoGrafica[] = [];
  datosDistribucion: DatoGrafica[] = [];
  columnasTabla: string[] = [];
  tituloGrafica1 = '';
  tituloGrafica2 = '';
  pdfPanelAbierto = false;
  coloresGrafica = ['#39ff14', '#3b82f6', '#e67e22', '#e74c3c', '#a855f7', '#06b6d4', '#f59e0b', '#10b981'];

  // ─── TOAST ─────────────────────────────────────────────────────────────────
  mostrarToast = false;
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';

  // ─── LIFECYCLE ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.rol = localStorage.getItem('rol') || '';
    const userData = localStorage.getItem('usuario') || localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        this.usuarioLogueado = parsed.nombres
          ? `${parsed.nombres} ${parsed.apellidos}`
          : parsed.email || userData;
      } catch { this.usuarioLogueado = userData; }
    }
    this.inicializarFechas();
    this.cargarLaboratorios();
    this.cargarResumenGlobal();
    this.cargarUsuarios();
  }

  togglePdfPanel(): void {
    this.pdfPanelAbierto = !this.pdfPanelAbierto;
    if (this.pdfPanelAbierto) this.excelPanelAbierto = false;
  }

  toggleExcelPanel(): void {
    this.excelPanelAbierto = !this.excelPanelAbierto;
    if (this.excelPanelAbierto) this.pdfPanelAbierto = false;
  }

  // ─── DRAWER ────────────────────────────────────────────────────────────────
  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }
  onDocumentClick(event: Event): void {
    const el = event.target as HTMLElement;
    if (this.drawerAbierto && !el.closest('.drawer') && !el.closest('.btn-hamburger')) {
      this.drawerAbierto = false;
    }
    if (this.pdfPanelAbierto && !el.closest('.pdf-dropdown-wrap')) {
      this.pdfPanelAbierto = false;
    }
    if (this.excelPanelAbierto && !el.closest('.pdf-dropdown-wrap')) {
      this.excelPanelAbierto = false;
    }
  }

  // ─── NAVEGACIÓN ────────────────────────────────────────────────────────────
  volver(): void { this.router.navigate(['/dashboard']); }
  navegar(ruta: string): void { this.cerrarDrawer(); this.router.navigate([`/${ruta}`]); }
  logout(): void { localStorage.clear(); this.router.navigate(['/login']); }

  abrirModulo(index: number): void {
    this.moduloActivo = index;
    this.datosReporte = [];
    this.statsModulo = [];
    this.datosGrafica = [];
    this.datosDistribucion = [];
    this.busquedaRealizada = false;
    this.mostrarEstadisticas = false;
    this.limpiarFiltros();
    this.cdr.detectChanges();
  }

  volverAlCentro(): void {
    this.moduloActivo = null;
    this.datosReporte = [];
    this.busquedaRealizada = false;
    this.mostrarEstadisticas = false;
    this.cdr.detectChanges();
  }

  // ─── DATOS INICIALES ───────────────────────────────────────────────────────
  inicializarFechas(): void {
    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hoy.getDate() - 30);
    this.filtros.fechaInicio = hace30.toISOString().split('T')[0];
    this.filtros.fechaFin    = hoy.toISOString().split('T')[0];
  }

  cargarLaboratorios(): void {
    this.reportarService.getLaboratorios().subscribe({
      next: (data) => {
        this.laboratorios = data.map(l => ({
          codLaboratorio: l.codLaboratorio,
          nombreLab:      l.nombreLab
        }));
      },
      error: () => this.mostrarNotif('Error al cargar laboratorios', 'error')
    });
  }

  cargarUsuarios(): void {
    this.reportarService.getReporteUsuarios({}).subscribe({
      next: (res) => {
        this.usuarios = res.datos.map((u: any) => ({
          idUsuario:      u.idUsuario ?? 0,
          nombreCompleto: u.nombreCompleto
        }));
      },
      error: () => {}
    });
  }

  cargarResumenGlobal(): void {
    this.reportarService.getResumenGlobal().subscribe({
      next: (data) => {
        this.resumenGlobal = {
          reservas:    data.reservas    ?? 0,
          asistencias: data.asistencias ?? 0,
          fallas:      data.fallas      ?? 0,
          estudiantes: 0,
          equipos:     data.equipos     ?? 0,
          bloqueos:    data.bloqueos    ?? 0,
        };
        this.cdr.detectChanges();
      },
      error: () => console.warn('No se pudo cargar el resumen global')
    });
  }

  // ─── FILTROS ───────────────────────────────────────────────────────────────
  aplicarFiltros(): void {
    if (this.filtros.fechaInicio && this.filtros.fechaFin) {
      if (this.filtros.fechaInicio > this.filtros.fechaFin) {
        this.mostrarNotif('La fecha inicio no puede ser mayor a fecha fin', 'error');
        return;
      }
    }
    this.busquedaRealizada = true;
    this.cargando = true;

    const id = this.modulos[this.moduloActivo!].id;
    switch (id) {
      case 'uso':        this.generarUso();        break;
      case 'equipos':    this.generarEquipos();    break;
      case 'fallas':     this.generarFallas();     break;
      case 'usuarios':   this.generarUsuarios();   break;
      case 'reservas':   this.generarReservas();   break;
      case 'asistencia': this.generarAsistencia(); break;
      case 'academico':  this.generarAcademico();  break;
      case 'bloqueos':   this.generarBloqueos();   break;
    }
  }

  limpiarFiltros(): void {
    this.inicializarFechas();
    this.filtros.laboratorio = '';
    this.filtros.estado = '';
    this.filtros.idUsuario = '';
    this.datosReporte = [];
    this.statsModulo = [];
    this.datosGrafica = [];
    this.datosDistribucion = [];
    this.busquedaRealizada = false;
    this.mostrarEstadisticas = false;
    this.cdr.detectChanges();
  }

  private get filtrosActuales() {
    return {
      laboratorio: this.filtros.laboratorio || undefined,
      fechaInicio: this.filtros.fechaInicio || undefined,
      fechaFin:    this.filtros.fechaFin    || undefined,
      estado:      this.filtros.estado      || undefined,
      idUsuario:   this.filtros.idUsuario ? Number(this.filtros.idUsuario) : undefined,
    };
  }

  private onError(err: any): void {
    console.error(err);
    this.cargando = false;
    this.mostrarNotif('Error al cargar el reporte', 'error');
    this.cdr.detectChanges();
  }

  private onSuccess(): void {
    this.cargando = false;
    this.mostrarEstadisticas = true;
    this.mostrarNotif('Reporte generado correctamente');
    this.cdr.detectChanges();
  }

  // ─── GENERADORES ───────────────────────────────────────────────────────────

  private generarUso(): void {
    this.reportarService.getReporteUso(this.filtrosActuales).subscribe({
      next: (res) => {
        this.statsModulo = [
          { icono: '📅', valor: res.stats['totalReservas'] ?? 0, label: 'Total Reservas', color: '#39ff14' },
          { icono: '✅', valor: res.stats['aprobadas']    ?? 0, label: 'Aprobadas',       color: '#39ff14' },
          { icono: '⏳', valor: res.stats['pendientes']   ?? 0, label: 'Pendientes',      color: '#e67e22' },
          { icono: '❌', valor: res.stats['canceladas']   ?? 0, label: 'Canceladas',      color: '#e74c3c' },
        ];
        this.tituloGrafica1    = 'Reservas por Laboratorio';
        this.tituloGrafica2    = 'Distribución por Estado';
        this.datosGrafica      = res.grafica1;
        this.datosDistribucion = res.grafica2;
        this.columnasTabla     = ['LABORATORIO', 'FECHA', 'HORARIO', 'ESTUDIANTES', 'ESTADO'];
        this.datosReporte      = res.datos.map((d: ReporteUsoItem) => ({
          a: d.laboratorio, b: d.fecha, c: d.horario, d: d.numEstudiantes, estado: d.estado,
        }));
        this.onSuccess();
      },
      error: (err) => this.onError(err)
    });
  }

  private generarEquipos(): void {
    this.reportarService.getReporteEquipos(this.filtrosActuales).subscribe({
      next: (res) => {
        this.statsModulo = [
          { icono: '🖥️', valor: res.stats['totalEquipos'],  label: 'Total Equipos',     color: '#39ff14' },
          { icono: '✅',  valor: res.stats['operativos'],    label: 'Operativos',        color: '#39ff14' },
          { icono: '🔧',  valor: res.stats['mantenimiento'], label: 'En Mantenimiento',  color: '#e67e22' },
          { icono: '❌',  valor: res.stats['fueraServicio'], label: 'Fuera de Servicio', color: '#e74c3c' },
        ];
        this.tituloGrafica1    = 'Equipos por Laboratorio';
        this.tituloGrafica2    = 'Estado de Equipos';
        this.datosGrafica      = res.grafica1;
        this.datosDistribucion = res.grafica2;
        this.columnasTabla     = ['SERIE', 'NOMBRE', 'TIPO', 'LABORATORIO', 'ESTADO'];
        this.datosReporte      = res.datos.map((d: ReporteEquipoItem) => ({
          a: d.serie, b: d.nombre, c: d.tipo, d: d.laboratorio, estado: d.estado,
        }));
        this.onSuccess();
      },
      error: (err) => this.onError(err)
    });
  }

  private generarFallas(): void {
    this.reportarService.getReporteFallas(this.filtrosActuales).subscribe({
      next: (res) => {
        this.statsModulo = [
          { icono: '⚠️', valor: res.stats['totalFallas']      ?? 0, label: 'Total Fallas',      color: '#e74c3c' },
          { icono: '🏫', valor: res.stats['laboratorios']     ?? 0, label: 'Laboratorios',      color: '#e67e22' },
          { icono: '💻', valor: res.stats['equiposAfectados'] ?? 0, label: 'Equipos Afectados', color: '#3b82f6' },
        ];
        this.tituloGrafica1    = 'Fallas por Laboratorio';
        this.tituloGrafica2    = 'Top Equipos con Fallas';
        this.datosGrafica      = res.grafica1;
        this.datosDistribucion = res.grafica2;
        this.columnasTabla     = ['FECHA', 'LABORATORIO', 'EQUIPO', 'DESCRIPCIÓN', 'REPORTADO POR'];
        this.datosReporte      = res.datos.map((d: ReporteFallaItem) => ({
          a: d.fecha, b: d.laboratorio, c: d.equipo, d: d.descripcion, e: d.reportadoPor, estado: '',
        }));
        this.onSuccess();
      },
      error: (err) => this.onError(err)
    });
  }

  private generarUsuarios(): void {
    this.reportarService.getReporteUsuarios(this.filtrosActuales).subscribe({
      next: (res) => {
        this.statsModulo = [
          { icono: '👥', valor: res.stats['totalUsuarios'] ?? 0, label: 'Total Usuarios', color: '#3b82f6' },
          { icono: '✅', valor: res.stats['activos']       ?? 0, label: 'Activos',        color: '#39ff14' },
          { icono: '🚫', valor: res.stats['inactivos']     ?? 0, label: 'Inactivos',      color: '#e74c3c' },
        ];
        this.tituloGrafica1    = 'Usuarios por Estado';
        this.tituloGrafica2    = 'Distribución';
        this.datosGrafica      = res.grafica1;
        this.datosDistribucion = res.grafica2;
        this.columnasTabla     = ['IDENTIDAD', 'NOMBRE COMPLETO', 'EMAIL', 'USUARIO', 'ESTADO'];
        this.datosReporte      = res.datos.map((d: ReporteUsuarioItem) => ({
          a: d.identidad, b: d.nombreCompleto, c: d.email, d: d.usuario, estado: d.estado,
        }));
        this.onSuccess();
      },
      error: (err) => this.onError(err)
    });
  }

  private generarReservas(): void {
    this.reportarService.getReporteReservas(this.filtrosActuales).subscribe({
      next: (res) => {
        this.statsModulo = [
          { icono: '📋', valor: res.stats['total']      ?? 0, label: 'Total Reservas', color: '#e67e22' },
          { icono: '✅', valor: res.stats['aprobadas']  ?? 0, label: 'Aprobadas',      color: '#39ff14' },
          { icono: '⏳', valor: res.stats['pendientes'] ?? 0, label: 'Pendientes',     color: '#e67e22' },
          { icono: '❌', valor: res.stats['canceladas'] ?? 0, label: 'Canceladas',     color: '#e74c3c' },
        ];
        this.tituloGrafica1    = 'Reservas por Laboratorio';
        this.tituloGrafica2    = 'Estados de Reservas';
        this.datosGrafica      = res.grafica1;
        this.datosDistribucion = res.grafica2;
        this.columnasTabla     = ['FECHA', 'LABORATORIO', 'HORARIO', 'TIPO', 'MOTIVO', 'ESTADO'];
        this.datosReporte      = res.datos.map((item: ReporteReservaItem) => ({
          a: item.fecha, b: item.laboratorio, c: item.horario, d: item.tipo, e: item.motivo, estado: item.estado,
        }));
        this.onSuccess();
      },
      error: (err) => this.onError(err)
    });
  }

  private generarAsistencia(): void {
    this.reportarService.getReporteAsistencia(this.filtrosActuales).subscribe({
      next: (res) => {
        this.statsModulo = [
          { icono: '👥', valor: res.stats['totalAsistencias'] ?? 0, label: 'Total Registros', color: '#06b6d4' },
          { icono: '🏫', valor: res.stats['laboratorios']     ?? 0, label: 'Laboratorios',    color: '#39ff14' },
          { icono: '👨‍🏫', valor: res.stats['docentes']        ?? 0, label: 'Docentes',        color: '#e67e22' },
        ];
        this.tituloGrafica1    = 'Asistencias por Laboratorio';
        this.tituloGrafica2    = 'Asistencias por Docente';
        this.datosGrafica      = res.grafica1;
        this.datosDistribucion = res.grafica2;
        this.columnasTabla     = ['FECHA', 'LABORATORIO', 'DOCENTE', 'HORA APERTURA', 'OBSERVACIONES'];
        this.datosReporte      = res.datos.map((d: ReporteAsistenciaItem) => ({
          a: d.fecha, b: d.laboratorio, c: d.docente, d: d.asistieron, estado: d.porcentaje,
        }));
        this.onSuccess();
      },
      error: (err) => this.onError(err)
    });
  }

  private generarAcademico(): void {
    this.reportarService.getReporteAcademico(this.filtrosActuales).subscribe({
      next: (res) => {
        this.statsModulo = [
          { icono: '📖', valor: res.stats['totalClases']  ?? 0, label: 'Total Clases',  color: '#f59e0b' },
          { icono: '🏫', valor: res.stats['laboratorios'] ?? 0, label: 'Laboratorios',  color: '#39ff14' },
          { icono: '👨‍🏫', valor: res.stats['docentes']    ?? 0, label: 'Docentes',      color: '#3b82f6' },
        ];
        this.tituloGrafica1    = 'Clases por Laboratorio';
        this.tituloGrafica2    = 'Clases por Docente';
        this.datosGrafica      = res.grafica1;
        this.datosDistribucion = res.grafica2;
        this.columnasTabla     = ['ASIGNATURA', 'CARRERA', 'DOCENTE', 'LABORATORIO', 'ESTADO'];
        this.datosReporte      = res.datos.map((d: ReporteAcademicoItem) => ({
          a: d.asignatura, b: d.carrera, c: d.docente, d: d.laboratorio, estado: d.estado,
        }));
        this.onSuccess();
      },
      error: (err) => this.onError(err)
    });
  }

  private generarBloqueos(): void {
    this.reportarService.getReporteBloqueos(this.filtrosActuales).subscribe({
      next: (res) => {
        this.statsModulo = [
          { icono: '🔒', valor: res.stats['totalBloqueos'] ?? 0, label: 'Total Bloqueos', color: '#a855f7' },
          { icono: '🔴', valor: res.stats['activos']       ?? 0, label: 'Activos',        color: '#e74c3c' },
          { icono: '🏫', valor: res.stats['laboratorios']  ?? 0, label: 'Laboratorios',   color: '#3b82f6' },
        ];
        this.tituloGrafica1    = 'Bloqueos por Laboratorio';
        this.tituloGrafica2    = 'Bloqueos por Tipo';
        this.datosGrafica      = res.grafica1;
        this.datosDistribucion = res.grafica2;
        this.columnasTabla     = ['LABORATORIO', 'TIPO', 'MOTIVO', 'INICIO', 'FIN', 'ESTADO'];
        this.datosReporte      = res.datos.map((item: ReporteBloqueosItem) => ({
          a: item.laboratorio, b: item.tipo, c: item.motivo,
          d: item.fechaInicio, e: item.fechaFin, estado: item.estado,
        }));
        this.onSuccess();
      },
      error: (err) => this.onError(err)
    });
  }

  // ─── TABLA HELPER ──────────────────────────────────────────────────────────
  filasTabla(fila: any): string[] {
    const vals: string[] = [];
    const keys = ['a', 'b', 'c', 'd', 'e', 'f'];
    for (const k of keys) {
      if (k in fila) vals.push(fila[k] ?? '');
    }
    if (fila.estado !== undefined && fila.estado !== '') {
      vals.push(fila.estado);
    }
    return vals;
  }

  getBadgeClass(estado: string): string {
    const e = (estado || '').toUpperCase();
    if (['COMPLETADA','OPERATIVO','ACTIVO','ACTIVA','APROBADA','LIBERADO','RESUELTO'].some(x => e.includes(x))) return 'badge-activo';
    if (['MANTENIMIENTO','PENDIENTE','EN PROCESO'].some(x => e.includes(x))) return 'badge-warning';
    if (e.match(/^\d+%$/)) return parseFloat(e) >= 85 ? 'badge-activo' : parseFloat(e) >= 70 ? 'badge-warning' : 'badge-inactivo';
    return 'badge-inactivo';
  }

  // ─── EXPORTAR ──────────────────────────────────────────────────────────────
  exportarPDF(): void {
    if (!this.mostrarEstadisticas || this.datosReporte.length === 0) {
      this.mostrarNotif('Primero genera el reporte', 'error'); return;
    }
    const modulo    = this.modulos[this.moduloActivo!];
    const labNombre = this.laboratorios.find(
      l => String(l.codLaboratorio) === this.filtros.laboratorio
    )?.nombreLab ?? 'Todos';

    this.exportPdf.exportar({
      modulo,
      statsModulo:       this.statsModulo,
      datosGrafica:      this.datosGrafica,
      datosDistribucion: this.datosDistribucion,
      tituloGrafica1:    this.tituloGrafica1,
      tituloGrafica2:    this.tituloGrafica2,
      columnasTabla:     this.columnasTabla,
      datosReporte:      this.datosReporte,
      temaOscuro:        this.temaOscuro,
      colorHeader:       this.colorHeader,
      colorAcento:       this.colorAcento,
      filasTabla:        (fila) => this.filasTabla(fila),
      filtros: {
        laboratorio: this.filtros.laboratorio,
        fechaInicio: this.filtros.fechaInicio,
        fechaFin:    this.filtros.fechaFin,
        estado:      this.filtros.estado,
      },
      nombreLaboratorio: labNombre,
      usuarioLogueado:   this.usuarioLogueado,
    }).then(() => this.mostrarNotif('PDF generado correctamente'));
  }

  exportarExcel(): void {
    if (!this.mostrarEstadisticas || this.datosReporte.length === 0) {
      this.mostrarNotif('Primero genera el reporte', 'error'); return;
    }
    const modulo    = this.modulos[this.moduloActivo!];
    const labNombre = this.laboratorios.find(
      l => String(l.codLaboratorio) === this.filtros.laboratorio
    )?.nombreLab ?? 'Todos';

    this.exportExcel.exportar({
      modulo,
      statsModulo:       this.incluirGraficas ? this.statsModulo       : [],
      datosGrafica:      this.incluirGraficas ? this.datosGrafica      : [],
      datosDistribucion: this.incluirGraficas ? this.datosDistribucion : [],
      tituloGrafica1:    this.tituloGrafica1,
      tituloGrafica2:    this.tituloGrafica2,
      columnasTabla:     this.columnasTabla,
      datosReporte:      this.datosReporte,
      filasTabla:        (fila) => this.filasTabla(fila),
      filtros: {
        laboratorio: this.filtros.laboratorio,
        fechaInicio: this.filtros.fechaInicio,
        fechaFin:    this.filtros.fechaFin,
        estado:      this.filtros.estado,
      },
      nombreLaboratorio: labNombre,
      usuarioLogueado:   this.usuarioLogueado,
      incluirResumen:    this.incluirGraficas,
      colorAcento:       this.colorAcento,
      colorFondo:        this.colorFondo,
      temaOscuro:        this.temaOscuro,
    }).then(() => this.mostrarNotif('Excel generado correctamente'));
  }

  // ─── TOAST ─────────────────────────────────────────────────────────────────
  mostrarNotif(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    this.toastMensaje = mensaje;
    this.toastTipo    = tipo;
    this.mostrarToast = true;
    this.cdr.detectChanges();
    setTimeout(() => { this.mostrarToast = false; this.cdr.detectChanges(); }, 3000);
  }
}
