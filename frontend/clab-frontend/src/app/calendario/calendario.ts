import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

interface ReservaCalendario {
  id: number;
  laboratorio: string;
  dia: number;
  horaInicio: number;
  duracion: number;
  titulo: string;
  docente: string;
  estado: string;
  esPropia: boolean;
  horaInicioStr: string;
  horaFinStr: string;
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

  semanaLabel       = '';
  semanaOffset      = 0;
  fechaInicioSemana!: Date;
  esHoy             = true;

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
    this.cargarReservas();
  }

  calcularSemana(): void {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diffLunes = (diaSemana === 0) ? -6 : 1 - diaSemana;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + diffLunes + (this.semanaOffset * 7));
    lunes.setHours(0, 0, 0, 0);
    this.fechaInicioSemana = lunes;
    const fin = this.finDeSemana();
    const fmt = (d: Date) => d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' });
    this.semanaLabel = `${fmt(lunes)} – ${fmt(fin)} · ${lunes.getFullYear()}`;
    this.esHoy = this.semanaOffset === 0;
  }

  semanaAnterior(): void { this.semanaOffset--; this.calcularSemana(); this.cargarReservas(); }
  semanaSiguiente(): void { this.semanaOffset++; this.calcularSemana(); this.cargarReservas(); }
  irAHoy(): void { this.semanaOffset = 0; this.calcularSemana(); this.cargarReservas(); }

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

  private procesarReservas(datos: any[]): void {
    const activas = datos.filter(r =>
      r.estado?.toLowerCase() !== 'cancelada' && r.estado?.toLowerCase() !== 'rechazada'
    );

    const labsSet = new Set<string>(activas.map(r => r.nombreLaboratorio));
    this.laboratorios = Array.from(labsSet);
    this.laboratorios.forEach((lab, i) => {
      if (!this.coloresLab[lab]) this.coloresLab[lab] = PALETA[i % PALETA.length];
    });

    this.reservas = activas.map(r => {
      const fecha = new Date(r.fechaReserva + 'T00:00:00');
      const dia   = this.diaIndex(fecha);
      if (dia === -1) return null;

      const esPropia = !this.esDocente || Number(r.idUsuario) === Number(this.idUsuario);

      const parseSlot = (h: string): number => {
        if (!h) return 0;
        const partes = h.toString().split(':');
        const hh = parseInt(partes[0], 10);
        const mm = parseInt(partes[1] || '0', 10);
        const base = parseInt(this.horas[0].split(':')[0], 10);
        return (hh - base) * 2 + (mm >= 30 ? 1 : 0);
      };

      const slotInicio = parseSlot(r.horaInicio);
      const slotFin    = parseSlot(r.horaFin);
      const duracion   = Math.max(1, slotFin - slotInicio);

      return {
        id:           r.idReserva,
        laboratorio:  r.nombreLaboratorio || 'Sin lab',
        dia,
        horaInicio:   slotInicio,
        duracion,
        titulo:       esPropia ? (r.nombreAsignatura || r.motivo || 'Reserva') : 'Ocupado',
        docente:      esPropia ? (r.nombreUsuario || '') : '',
        estado:       r.estado || '',
        esPropia,
        horaInicioStr: r.horaInicio?.toString().substring(0, 5) || '',
        horaFinStr:    r.horaFin?.toString().substring(0, 5)    || '',
      } as ReservaCalendario;
    }).filter((r): r is ReservaCalendario => r !== null);
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
    return (diff >= 0 && diff <= 5) ? diff : -1;
  }

  private horaIndex(horaStr: string): number {
    if (!horaStr) return 0;
    const h    = parseInt(horaStr.toString().split(':')[0], 10);
    const base = parseInt(this.horas[0].split(':')[0], 10);
    return Math.max(0, h - base);
  }

  getReservasDeCelda(dia: number, horaIdx: number): ReservaCalendario[] {
    return this.reservas.filter(r => r.dia === dia && r.horaInicio === horaIdx);
  }

  celdaEstaOcupada(dia: number, horaIdx: number): boolean {
    return this.reservas.some(r =>
      r.dia === dia &&
      horaIdx >= r.horaInicio &&
      horaIdx < r.horaInicio + r.duracion
    );
  }

  onCeldaClick(dia: number, horaIdx: number): void {
    if (!this.esDocente) return;
    if (this.celdaEstaOcupada(dia, horaIdx)) return;

    const SLOTS_DEFAULT = 2;
    let slotsLibres = 0;
    for (let i = horaIdx; i < this.horas.length; i++) {
      if (this.celdaEstaOcupada(dia, i)) break;
      slotsLibres++;
    }
    if (slotsLibres === 0) return;

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
      horaInicio,
      horaFin,
      fechaStr: this.formatFecha(fecha)
    };
    this.mostrarModalNuevaReserva = true;
    this.cdr.detectChanges();
  }

  confirmarNuevaReserva(): void {
    this.mostrarModalNuevaReserva = false;
    // ← ruta corregida: 'solicitudes-reserva' (no 'solicitar-reserva')
    this.router.navigate(['/solicitudes-reserva'], {
      queryParams: {
        fecha:      this.modalConfirmData.fechaStr,
        horaInicio: this.modalConfirmData.horaInicio,
        horaFin:    this.modalConfirmData.horaFin
      }
    });
  }

  cerrarModalNuevaReserva(): void {
    this.mostrarModalNuevaReserva = false;
    this.cdr.detectChanges();
  }

  getAlturaBloque(duracion: number): number { return duracion * 26 - 3; }
  getColorLab(lab: string): string { return this.coloresLab[lab] ?? '#39ff14'; }
  getHoraFin(reserva: ReservaCalendario): string {
    return reserva.horaFinStr || this.horas[Math.min(reserva.horaInicio + reserva.duracion, this.horas.length - 1)];
  }

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

  finDeSemana(): Date {
    const fin = new Date(this.fechaInicioSemana);
    fin.setDate(fin.getDate() + 5);
    return fin;
  }

  formatFecha(d: Date): string { return d.toISOString().split('T')[0]; }

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
