import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Notificacion} from '../interfaces/Notificacion.model';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.scss']
})
export class NotificacionesComponent implements OnInit {

  drawerAbierto = false;
  rol = sessionStorage.getItem('rol') || '';
  usuarioLogueado = sessionStorage.getItem('usuario') || 'Usuario';

  notificaciones: Notificacion[] = [];
  cargando = true;
  error = '';

  // Filtros
  pestanaActiva: 'TODAS' | 'NO_LEIDA' | 'LEIDA' = 'TODAS';
  filtroTipo: string = 'TODOS';

  // Modal detalle
  modalDetalleAbierto = false;
  notifDetalle: Notificacion | null = null;

  // Modal responder
  modalResponderAbierto = false;
  notifAResponder: Notificacion | null = null;
  mensajeRespuesta = '';
  enviandoRespuesta = false;

  private apiUrl = 'http://localhost:8080';

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.rol = sessionStorage.getItem('rol') || '';
    this.usuarioLogueado = sessionStorage.getItem('usuario') || 'Usuario';
    this.cargarNotificaciones();
  }

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  cargarNotificaciones(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.http.get<Notificacion[]>(
      `${this.apiUrl}/notificaciones/mis-notificaciones`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.notificaciones = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = 'Error al cargar notificaciones';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Filtrado ─────────────────────────────────────────────────────

  get notificacionesFiltradas(): Notificacion[] {
    return this.notificaciones.filter(n => {
      const pasaPestana =
        this.pestanaActiva === 'TODAS' || n.estado === this.pestanaActiva;
      const pasaTipo =
        this.filtroTipo === 'TODOS' || n.tipoNotificacion === this.filtroTipo;
      return pasaPestana && pasaTipo;
    });
  }

  get notificacionesHoy(): Notificacion[] {
    const hoy = new Date().toISOString().split('T')[0];
    return this.notificacionesFiltradas.filter(n => n.fechaCreacion === hoy);
  }

  get notificacionesSemana(): Notificacion[] {
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];
    const hace7 = new Date(hoy);
    hace7.setDate(hoy.getDate() - 7);
    return this.notificacionesFiltradas.filter(n => {
      const fecha = new Date(n.fechaCreacion);
      return n.fechaCreacion !== hoyStr && fecha >= hace7 && fecha <= hoy;
    });
  }

  get notificacionesAnteriores(): Notificacion[] {
    const hoy = new Date();
    const hace7 = new Date(hoy);
    hace7.setDate(hoy.getDate() - 7);
    return this.notificacionesFiltradas.filter(n => {
      return new Date(n.fechaCreacion) < hace7;
    });
  }

  // ── Contadores ───────────────────────────────────────────────────

  get totalNoLeidas(): number {
    return this.notificaciones.filter(n => n.estado === 'NO_LEIDA').length;
  }

  contarPorTipo(tipo: string): number {
    return this.notificaciones.filter(n =>
      n.tipoNotificacion === tipo && n.estado === 'NO_LEIDA'
    ).length;
  }

  // ── Acciones ─────────────────────────────────────────────────────

  verDetalle(n: Notificacion): void {
    this.notifDetalle = n;
    this.modalDetalleAbierto = true;
    if (n.estado === 'NO_LEIDA') {
      this.marcarLeida(n.idNotificacion);
    }
    this.cdr.detectChanges();
  }

  cerrarDetalle(): void {
    this.modalDetalleAbierto = false;
    this.notifDetalle = null;
    this.cdr.detectChanges();
  }

  marcarLeida(id: number): void {
    const n = this.notificaciones.find(x => x.idNotificacion === id);
    if (!n || n.estado === 'LEIDA') return;

    this.http.put(
      `${this.apiUrl}/notificaciones/leer/${id}`, {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        n.estado = 'LEIDA';
        this.cdr.detectChanges();
      }
    });
  }

  marcarTodasLeidas(): void {
    this.http.put(
      `${this.apiUrl}/notificaciones/leer-todas`, {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.notificaciones.forEach(n => n.estado = 'LEIDA');
        this.cdr.detectChanges();
      }
    });
  }

  eliminar(id: number, event: Event): void {
    event.stopPropagation();
    this.http.delete(
      `${this.apiUrl}/notificaciones/eliminar/${id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.notificaciones = this.notificaciones.filter(n => n.idNotificacion !== id);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error eliminando:', err)
    });
  }

  abrirResponder(n: Notificacion, event: Event): void {
    event.stopPropagation();
    this.notifAResponder = n;
    this.mensajeRespuesta = '';
    this.modalResponderAbierto = true;
    this.cdr.detectChanges();
  }

  cerrarResponder(): void {
    this.modalResponderAbierto = false;
    this.notifAResponder = null;
    this.mensajeRespuesta = '';
    this.cdr.detectChanges();
  }

  confirmarRespuesta(): void {
    if (!this.notifAResponder || !this.mensajeRespuesta.trim()) return;
    this.enviandoRespuesta = true;

    this.http.post(
      `${this.apiUrl}/notificaciones/responder/${this.notifAResponder.idNotificacion}`,
      { mensaje: this.mensajeRespuesta },
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.enviandoRespuesta = false;
        this.cerrarResponder();
      },
      error: (err) => {
        console.error('Error enviando respuesta:', err);
        this.enviandoRespuesta = false;
      }
    });
  }

  // ── Filtros UI ───────────────────────────────────────────────────

  setPestana(p: 'TODAS' | 'NO_LEIDA' | 'LEIDA'): void {
    this.pestanaActiva = p;
    this.cdr.detectChanges();
  }

  setFiltroTipo(tipo: string): void {
    this.filtroTipo = tipo;
    this.cdr.detectChanges();
  }

  // ── Helpers visuales ─────────────────────────────────────────────

  getClase(tipo: string): string {
    switch (tipo) {
      case 'FALLA':          return 'warning';
      case 'FALLA_RESUELTA': return 'success';
      case 'RESERVA':        return 'info';
      case 'BLOQUEO':        return 'danger';
      default:               return 'info';
    }
  }

  getIcono(tipo: string): string {
    switch (tipo) {
      case 'FALLA':          return '⚠️';
      case 'FALLA_RESUELTA': return '✅';
      case 'RESERVA':        return '📅';
      case 'BLOQUEO':        return '🚫';
      default:               return '🔔';
    }
  }
  getIconoImg(tipo: string): string {
    const iconos: Record<string, string> = {
      'FALLA':          '/fallas.png',
      'RESERVA':        '/reservacalendario.png',
      'BLOQUEO':        '/bloqueos.png',
      'FALLA_RESUELTA': '/check.png',
    };
    return iconos[tipo] ?? '/notificacion.png';
  }
  stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // ── Navegación ───────────────────────────────────────────────────

  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }
  navegar(ruta: string, texto: string): void {
    this.cerrarDrawer();
    this.router.navigate([`/${ruta}`]);
  }
  logout(): void { sessionStorage.clear(); this.router.navigate(['/login']); }
  volver(): void { this.router.navigate(['/dashboard']); }
}
