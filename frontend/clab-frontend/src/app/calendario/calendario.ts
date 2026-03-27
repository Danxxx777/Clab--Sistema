import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

interface ReservaCalendario {
  id: number;
  laboratorio: string;
  dia: number;           // índice 0-5 (Lun-Sáb) para vista semana
  horaInicio: number;    // slot index
  duracion: number;      // slots
  titulo: string;
  docente: string;
  estado: string;
  esPropia: boolean;
  horaInicioStr: string;
  horaFinStr: string;
  fechaStr?: string;     // para vista mes: "Jue 26 · 07:30 – 09:00"
  fechaObj?: Date;       // para vista mes
  col?: number;
  totalCols?: number;
}

const PALETA = [
  '#39ff14', '#00e5ff', '#ff6b35',
  '#a855f7', '#f59e0b', '#ec4899',
  '#14b8a6', '#f43f5e', '#6366f1',
];

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.scss']
})
export class CalendarioComponent implements OnInit {

  private apiUrl = 'http://localhost:8080';

  drawerAbierto   = false;
  cargando        = false;
  loadingText     = '';
  cargandoDatos   = false;
  errorCarga      = false;
  usuarioLogueado = '';
  rolActual       = '';
  idUsuario       = 0;
  esDocente       = false;

  dias   = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  horas: string[] = [];

  laboratorios: string[] = [];
  coloresLab: Record<string, string> = {};
  reservas: ReservaCalendario[] = [];
  reservaSeleccionada: ReservaCalendario | null = null;

  // ── Vista activa ──────────────────────────────────────────────────────────
  vistaActiva: 'Hoy' | 'Semana' | 'Mes' = 'Semana';

  // ── Semana ────────────────────────────────────────────────────────────────
  semanaOffset      = 0;
  fechaInicioSemana!: Date;

  // ── Mes ───────────────────────────────────────────────────────────────────
  mesOffset = 0;
  diasMes: (Date | null)[] = [];

  // Label dinámico según vista
  periodoLabel = '';

  mostrarModalNuevaReserva = false;
  modalConfirmData = { fechaLabel: '', horaInicio: '', horaFin: '', fechaStr: '' };

  constructor(
    private router: Router,
    private auth: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';
    this.rolActual       = localStorage.getItem('rol')     || '';
    this.idUsuario       = parseInt(localStorage.getItem('idUsuario') || '0');
    this.esDocente       = this.rolActual === 'Docente';
    this.construirHoras();
    this.calcularSemana();
    this.cargarDatos();
  }

  // ── Navegación unificada ──────────────────────────────────────────────────
  navAnterior(): void {
    if (this.vistaActiva === 'Mes') { this.mesOffset--; this.calcularMes(); this.cargarDatos(); }
    else { this.semanaOffset--; this.calcularSemana(); this.cargarDatos(); }
  }

  navSiguiente(): void {
    if (this.vistaActiva === 'Mes') { this.mesOffset++; this.calcularMes(); this.cargarDatos(); }
    else { this.semanaOffset++; this.calcularSemana(); this.cargarDatos(); }
  }

  irAHoy(): void {
    this.vistaActiva  = 'Hoy';
    this.semanaOffset = 0;
    this.mesOffset    = 0;
    this.calcularSemana();
    this.cargarDatos();
  }

  setVista(v: 'Hoy' | 'Semana' | 'Mes'): void {
    this.vistaActiva = v;
    if (v === 'Mes') { this.calcularMes(); this.cargarDatos(); }
    else             { this.calcularSemana(); this.cargarDatos(); }
  }

  // ── Semana ────────────────────────────────────────────────────────────────
  calcularSemana(): void {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + diffLunes + this.semanaOffset * 7);
    lunes.setHours(0, 0, 0, 0);
    this.fechaInicioSemana = lunes;
    const fin = this.finDeSemana();
    const fmt = (d: Date) => d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' });
    this.periodoLabel = `${fmt(lunes)} – ${fmt(fin)} · ${lunes.getFullYear()}`;
  }

  // ── Mes ───────────────────────────────────────────────────────────────────
  calcularMes(): void {
    const hoy    = new Date();
    const año    = hoy.getFullYear();
    const mes    = hoy.getMonth() + this.mesOffset;
    const fecha  = new Date(año, mes, 1);
    this.diasMes = this.buildDiasMes(fecha);
    this.periodoLabel = fecha.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' })
      .replace(/^\w/, c => c.toUpperCase());
  }

  private buildDiasMes(primerDia: Date): (Date | null)[] {
    const dias: (Date | null)[] = [];
    // Lunes = 0, offset para alinear
    let offset = primerDia.getDay() - 1;
    if (offset < 0) offset = 6;
    for (let i = 0; i < offset; i++) dias.push(null);
    const mes = primerDia.getMonth();
    const año = primerDia.getFullYear();
    let d = 1;
    while (new Date(año, mes, d).getMonth() === mes) {
      dias.push(new Date(año, mes, d));
      d++;
    }
    // Rellenar hasta completar la última fila
    while (dias.length % 7 !== 0) dias.push(null);
    return dias;
  }

  // ── Carga de datos ────────────────────────────────────────────────────────
  cargarDatos(): void {
    if (this.vistaActiva === 'Mes') { this.cargarReservasMes(); }
    else                             { this.cargarReservas(); }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  cargarReservas(): void {
    this.cargandoDatos       = true;
    this.errorCarga          = false;
    this.reservaSeleccionada = null;
    const inicio = this.formatFecha(this.fechaInicioSemana);
    const fin    = this.formatFecha(this.finDeSemana());
    this.http.get<any[]>(
      `${this.apiUrl}/reservas/semana?inicio=${inicio}&fin=${fin}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: datos => { this.procesarReservas(datos); this.cargandoDatos = false; this.cdr.detectChanges(); },
      error: () => { this.cargandoDatos = false; this.errorCarga = true; this.cdr.detectChanges(); }
    });
  }

  cargarReservasMes(): void {
    this.cargandoDatos       = true;
    this.errorCarga          = false;
    this.reservaSeleccionada = null;
    this.calcularMes();

    const fechasValidas = this.diasMes.filter((d): d is Date => d !== null);
    if (!fechasValidas.length) { this.cargandoDatos = false; return; }

    const inicio = this.formatFecha(fechasValidas[0]);
    const fin    = this.formatFecha(fechasValidas[fechasValidas.length - 1]);

    this.http.get<any[]>(
      `${this.apiUrl}/reservas/semana?inicio=${inicio}&fin=${fin}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: datos => { this.procesarReservasMes(datos); this.cargandoDatos = false; this.cdr.detectChanges(); },
      error: () => { this.cargandoDatos = false; this.errorCarga = true; this.cdr.detectChanges(); }
    });
  }

  // ── Distribución solapadas ────────────────────────────────────────────────
  private asignarColumnas(reservas: ReservaCalendario[]): void {
    if (!reservas.length) return;
    reservas.sort((a, b) => a.horaInicio - b.horaInicio);
    const finPorCol: number[] = [];
    for (const r of reservas) {
      let asignada = false;
      for (let c = 0; c < finPorCol.length; c++) {
        if (finPorCol[c] <= r.horaInicio) {
          r.col = c; finPorCol[c] = r.horaInicio + r.duracion; asignada = true; break;
        }
      }
      if (!asignada) { r.col = finPorCol.length; finPorCol.push(r.horaInicio + r.duracion); }
    }
    for (const r of reservas) {
      const conc = reservas.filter(o =>
        o.horaInicio < r.horaInicio + r.duracion && r.horaInicio < o.horaInicio + o.duracion
      );
      r.totalCols = Math.max(...conc.map(o => (o.col ?? 0) + 1));
    }
  }

  private procesarReservas(datos: any[]): void {
    const activas = datos.filter(r =>
      r.estado?.toLowerCase() !== 'cancelada' && r.estado?.toLowerCase() !== 'rechazada'
    );
    this.actualizarLaboratorios(activas);

    this.reservas = activas.map(r => {
      const fecha = new Date(r.fechaReserva + 'T00:00:00');
      const dia   = this.diaIndex(fecha);
      if (dia === -1) return null;
      const esPropia = !this.esDocente || Number(r.idUsuario) === Number(this.idUsuario);
      const slotInicio = this.parseSlot(r.horaInicio);
      const slotFin    = this.parseSlot(r.horaFin);
      return {
        id:           r.idReserva,
        laboratorio:  r.nombreLaboratorio || 'Sin lab',
        dia, horaInicio: slotInicio,
        duracion:     Math.max(1, slotFin - slotInicio),
        titulo:       esPropia ? (r.nombreAsignatura || r.motivo || 'Reserva') : 'Ocupado',
        docente:      esPropia ? (r.nombreUsuario || '') : '',
        estado:       r.estado || '',
        esPropia,
        horaInicioStr: r.horaInicio?.toString().substring(0, 5) || '',
        horaFinStr:    r.horaFin?.toString().substring(0, 5) || '',
        col: 0, totalCols: 1
      } as ReservaCalendario;
    }).filter((r): r is ReservaCalendario => r !== null);

    for (let dia = 0; dia <= 5; dia++) {
      this.asignarColumnas(this.reservas.filter(r => r.dia === dia));
    }
  }

  private procesarReservasMes(datos: any[]): void {
    const activas = datos.filter(r =>
      r.estado?.toLowerCase() !== 'cancelada' && r.estado?.toLowerCase() !== 'rechazada'
    );
    this.actualizarLaboratorios(activas);

    this.reservas = activas.map(r => {
      const fecha    = new Date(r.fechaReserva + 'T00:00:00');
      const esPropia = !this.esDocente || Number(r.idUsuario) === Number(this.idUsuario);
      const diaLabel = fecha.toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric' });
      return {
        id:           r.idReserva,
        laboratorio:  r.nombreLaboratorio || 'Sin lab',
        dia:          -1,
        horaInicio:   0,
        duracion:     1,
        titulo:       esPropia ? (r.nombreAsignatura || r.motivo || 'Reserva') : 'Ocupado',
        docente:      esPropia ? (r.nombreUsuario || '') : '',
        estado:       r.estado || '',
        esPropia,
        horaInicioStr: r.horaInicio?.toString().substring(0, 5) || '',
        horaFinStr:    r.horaFin?.toString().substring(0, 5) || '',
        fechaStr:     `${diaLabel} · ${r.horaInicio?.toString().substring(0,5)} – ${r.horaFin?.toString().substring(0,5)}`,
        fechaObj:     fecha,
        col: 0, totalCols: 1
      } as ReservaCalendario;
    });
  }

  private actualizarLaboratorios(datos: any[]): void {
    const labsSet = new Set<string>(datos.map(r => r.nombreLaboratorio).filter(Boolean));
    this.laboratorios = Array.from(labsSet);
    this.laboratorios.forEach((lab, i) => {
      if (!this.coloresLab[lab]) this.coloresLab[lab] = PALETA[i % PALETA.length];
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private parseSlot(h: string): number {
    if (!h) return 0;
    const partes = h.toString().split(':');
    const hh  = parseInt(partes[0], 10);
    const mm  = parseInt(partes[1] || '0', 10);
    const base = parseInt(this.horas[0]?.split(':')[0] || '7', 10);
    return (hh - base) * 2 + (mm >= 30 ? 1 : 0);
  }

  private construirHoras(hMin = 7, hMax = 18): void {
    this.horas = [];
    for (let h = hMin; h <= hMax; h++) {
      this.horas.push(`${h.toString().padStart(2,'0')}:00`);
      if (h < hMax) this.horas.push(`${h.toString().padStart(2,'0')}:30`);
    }
  }

  private diaIndex(fecha: Date): number {
    const diff = Math.round((fecha.getTime() - this.fechaInicioSemana.getTime()) / 86_400_000);
    return diff >= 0 && diff <= 5 ? diff : -1;
  }

  finDeSemana(): Date {
    const fin = new Date(this.fechaInicioSemana);
    fin.setDate(fin.getDate() + 5);
    return fin;
  }

  formatFecha(d: Date): string { return d.toISOString().split('T')[0]; }

  // ── Métodos para el template ──────────────────────────────────────────────

  /** Número del día (ej: 23) para el header de la vista semana */
  getNumeroDia(diaIdx: number): number {
    const fecha = new Date(this.fechaInicioSemana);
    fecha.setDate(fecha.getDate() + diaIdx);
    return fecha.getDate();
  }

  /** Si el día i de la semana actual es hoy */
  esDiaDeHoy(diaIdx: number): boolean {
    const hoy   = new Date();
    const fecha = new Date(this.fechaInicioSemana);
    fecha.setDate(fecha.getDate() + diaIdx);
    return fecha.toDateString() === hoy.toDateString();
  }

  /** Si una fecha (vista mes) es hoy */
  esFechaHoy(fecha: Date): boolean {
    return fecha.toDateString() === new Date().toDateString();
  }

  /** Reservas de una celda (vista semana) */
  getReservasDeCelda(dia: number, horaIdx: number): ReservaCalendario[] {
    return this.reservas.filter(r => r.dia === dia && r.horaInicio === horaIdx);
  }

  /** Reservas de un día (vista mes) */
  getReservasDeDia(fecha: Date): ReservaCalendario[] {
    return this.reservas.filter(r =>
      r.fechaObj && r.fechaObj.toDateString() === fecha.toDateString()
    );
  }

  celdaEstaOcupada(dia: number, horaIdx: number): boolean {
    return this.reservas.some(r =>
      r.dia === dia && horaIdx >= r.horaInicio && horaIdx < r.horaInicio + r.duracion
    );
  }

  onCeldaClick(dia: number, horaIdx: number): void {
    if (!this.esDocente || this.celdaEstaOcupada(dia, horaIdx)) return;

    const SLOTS_DEFAULT = 2;
    let slotsLibres = 0;
    for (let i = horaIdx; i < this.horas.length; i++) {
      if (this.celdaEstaOcupada(dia, i)) break;
      slotsLibres++;
    }
    if (!slotsLibres) return;

    const slotsAUsar = Math.min(SLOTS_DEFAULT, slotsLibres);
    const fecha = new Date(this.fechaInicioSemana);
    fecha.setDate(fecha.getDate() + dia);
    const horaInicio = this.horas[horaIdx] || '08:00';
    const horaFin    = this.horas[Math.min(horaIdx + slotsAUsar, this.horas.length - 1)] || '09:00';
    const fechaLabel = fecha.toLocaleDateString('es-EC', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    this.modalConfirmData = {
      fechaLabel: fechaLabel.charAt(0).toUpperCase() + fechaLabel.slice(1),
      horaInicio, horaFin,
      fechaStr: this.formatFecha(fecha)
    };
    this.mostrarModalNuevaReserva = true;
    this.cdr.detectChanges();
  }

  confirmarNuevaReserva(): void {
    this.mostrarModalNuevaReserva = false;
    this.router.navigate(['/solicitudes-reserva'], {
      queryParams: {
        fecha:      this.modalConfirmData.fechaStr,
        horaInicio: this.modalConfirmData.horaInicio,
        horaFin:    this.modalConfirmData.horaFin
      }
    });
  }

  cerrarModalNuevaReserva(): void { this.mostrarModalNuevaReserva = false; this.cdr.detectChanges(); }

  getAlturaBloque(duracion: number): number { return duracion * 40 - 3; }
  getColorLab(lab: string): string { return this.coloresLab[lab] ?? '#39ff14'; }

  getBadgeEstado(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'APROBADA':  return 'badge--aprobada';
      case 'PENDIENTE': return 'badge--pendiente';
      default:          return 'badge--otro';
    }
  }

  seleccionar(reserva: ReservaCalendario): void {
    if (this.esDocente && !reserva.esPropia) return;
    this.reservaSeleccionada = this.reservaSeleccionada?.id === reserva.id ? null : reserva;
  }

  cerrarDetalle(): void { this.reservaSeleccionada = null; }

  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }

  navegar(ruta: string, texto = 'Cargando...'): void {
    this.cerrarDrawer();
    this.loadingText = texto;
    this.cargando    = true;
    this.cdr.detectChanges();
    setTimeout(() => this.router.navigate([ruta]), 450);
  }

  logout(): void { this.auth.logout(); this.router.navigate(['/']); }
}
