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
  rol = localStorage.getItem('rol') || '';
  usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';

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
    this.rol = localStorage.getItem('rol') || '';
    this.usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';
    this.cargarNotificaciones();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
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

        // ← Guardar en localStorage
        const respondidas = JSON.parse(localStorage.getItem('notif_respondidas') || '[]');
        respondidas.push(this.notifAResponder!.idNotificacion);
        localStorage.setItem('notif_respondidas', JSON.stringify(respondidas));

        this.cerrarResponder();
        this.cdr.detectChanges();
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
  logout(): void { localStorage.clear(); this.router.navigate(['/login']); }
  volver(): void { this.router.navigate(['/dashboard']); }

  parsearMensaje(tipo: string, mensaje: string): any {
    if (!mensaje) return null;

    if (tipo === 'RESERVA') {
      // Patrón: "Nueva solicitud de reserva de <b>Nombre</b> para el FECHA de HH:MM a HH:MM"
      const solicitudMatch = mensaje.match(/de <b>(.*?)<\/b> para el (\d{4}-\d{2}-\d{2}) de (\d{2}:\d{2}) a (\d{2}:\d{2})/);
      if (solicitudMatch) {
        return {
          subtipo: 'solicitud',
          nombre: solicitudMatch[1],
          fecha: solicitudMatch[2],
          horaInicio: solicitudMatch[3],
          horaFin: solicitudMatch[4],
        };
      }
      // Patrón: "Se aprobó una reserva para el FECHA a las HH:MM:SS"
      const aprobadaMatch = mensaje.match(/Se aprobó una reserva para el (\d{4}-\d{2}-\d{2}) a las (\d{2}:\d{2})/);
      if (aprobadaMatch) {
        return {
          subtipo: 'aprobada',
          fecha: aprobadaMatch[1],
          hora: aprobadaMatch[2],
          laboratorio: this.notifDetalle?.asunto?.replace('Reserva aprobada en ', '') ?? '',
        };
      }
    }

    if (tipo === 'SISTEMA') {
      // Extrae nombre del usuario del HTML
      const nombreMatch = mensaje.match(/<b>Usuario:<\/b>\s*(.*?)</);
      if (nombreMatch) {
        return { subtipo: 'usuario', nombre: nombreMatch[1].trim() };
      }
    }

    if (tipo === 'FALLA') {
      const labMatch    = mensaje.match(/<b>Laboratorio:<\/b>\s*(.*?)<br>/);
      const repMatch    = mensaje.match(/<b>Reportado por:<\/b>\s*(.*?)<br>/);
      const descMatch   = mensaje.match(/<b>Descripción:<\/b>\s*(.*?)<\/div>/);
      return {
        subtipo:     'falla',
        laboratorio: labMatch?.[1]?.trim() ?? '—',
        reportadoPor: repMatch?.[1]?.trim() ?? '—',
        descripcion: descMatch?.[1]?.trim() ?? '—',
      };
    }

    if (tipo === 'FALLA_RESUELTA') {
      const originalMatch  = mensaje.match(/<b>Mensaje original:<\/b>\s*(.*?)<br>/);
      const respuestaMatch = mensaje.match(/<b>Respuesta:<\/b>\s*(.*?)<br>/);
      const porMatch       = mensaje.match(/Respondido por:\s*(.*?)<\/small>/);
      return {
        subtipo:   'resuelta',
        original:  originalMatch?.[1]?.trim() ?? '—',
        respuesta: respuestaMatch?.[1]?.trim() ?? '—',
        por:       porMatch?.[1]?.trim() ?? '—',
      };
    }

    return null;
  }
  esRespondida(id: number): boolean {
    const notif = this.notificaciones.find(n => n.idNotificacion === id);
    if (notif?.tipoNotificacion === 'FALLA_RESUELTA') return true;
    const respondidas = JSON.parse(localStorage.getItem('notif_respondidas') || '[]');
    return respondidas.includes(id);
  }
}
