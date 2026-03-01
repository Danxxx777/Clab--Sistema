import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface SolicitudReserva {
  id?: number;
  laboratorio: string;
  materia: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  cantidadEstudiantes: number | null;
  equipos: string[];
  motivo: string;
  estado: string;
  observaciones?: string;
}

@Component({
  selector: 'app-solicitudes-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes-reserva.html',
  styleUrls: ['./solicitudes-reserva.scss']
})
export class SolicitudesReservaComponent implements OnInit {

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  /* =========================
     ESTADO GENERAL
  ==========================*/
  usuarioLogueado = '';
  rol = '';
  drawerAbierto = false;
  guardando = false;

  mostrarNotificacion = false;
  notificacionTitulo = '';
  notificacionMensaje = '';
  notificacionTipo: 'exito' | 'error' | 'confirmar' = 'exito';
  accionPendiente: (() => void) | null = null;

  mostrarModal = false;
  modoModal: 'crear' | 'ver' = 'crear';

  solicitudes: SolicitudReserva[] = [];
  solicitudesFiltradas: SolicitudReserva[] = [];
  solicitudesPaginadas: SolicitudReserva[] = [];
  filtroEstado = 'Todos';

  solicitudActual: SolicitudReserva = this.nuevaSolicitud();

  /* =========================
     PAGINACIÓN
  ==========================*/
  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 1;

  /* =========================
     DATOS
  ==========================*/
  // Reemplaza con los laboratorios reales de tu backend
  laboratorios: string[] = [
    'Laboratorio A',
    'Laboratorio B',
    'Laboratorio C',
    'Laboratorio D'
  ];

  equiposDisponibles = [
    { nombre: 'Proyector',     icono: '📽️' },
    { nombre: 'Computadoras',  icono: '💻' },
    { nombre: 'Impresora',     icono: '🖨️' },
    { nombre: 'Pizarra Smart', icono: '🖥️' },
    { nombre: 'Cámara Web',    icono: '📷' },
    { nombre: 'Micrófonos',    icono: '🎙️' }
  ];

  /* =========================
     LIFECYCLE
  ==========================*/
  ngOnInit(): void {
    this.rol = localStorage.getItem('rol') || '';
    const userData = localStorage.getItem('usuario') || '';
    try {
      const parsed = JSON.parse(userData);
      this.usuarioLogueado = parsed.nombres
        ? `${parsed.nombres} ${parsed.apellidos}`
        : parsed.email || userData;
    } catch {
      this.usuarioLogueado = userData || 'Usuario';
    }

    this.cargarSolicitudes();
  }

  /* =========================
     CARGA
  ==========================*/
  cargarSolicitudes(): void {
    // TODO: reemplazar con llamada real al backend
    // this.http.get<SolicitudReserva[]>('http://localhost:8080/solicitudes').subscribe(...)
    this.solicitudes = [];
    this.filtrar();
  }

  /* =========================
     FILTRO Y PAGINACIÓN
  ==========================*/
  filtrar(): void {
    this.solicitudesFiltradas = this.filtroEstado === 'Todos'
      ? [...this.solicitudes]
      : this.solicitudes.filter(s => s.estado === this.filtroEstado);
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  actualizarPaginacion(): void {
    this.totalPaginas = Math.max(1, Math.ceil(this.solicitudesFiltradas.length / this.itemsPorPagina));
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    this.solicitudesPaginadas = this.solicitudesFiltradas.slice(inicio, inicio + this.itemsPorPagina);
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  /* =========================
     STATS
  ==========================*/
  totalPorEstado(estado: string): number {
    return this.solicitudes.filter(s => s.estado === estado).length;
  }

  /* =========================
     MODAL
  ==========================*/
  abrirModal(): void {
    this.modoModal = 'crear';
    this.solicitudActual = this.nuevaSolicitud();
    this.mostrarModal = true;
  }

  verDetalle(s: SolicitudReserva): void {
    this.modoModal = 'ver';
    this.solicitudActual = { ...s };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.guardando = false;
    this.cdr.detectChanges();
  }

  /* =========================
     GUARDAR
  ==========================*/
  guardarSolicitud(): void {
    const s = this.solicitudActual;

    if (!s.laboratorio || !s.materia || !s.fecha ||
      !s.horaInicio || !s.horaFin ||
      !s.cantidadEstudiantes || !s.motivo?.trim()) {
      this.mostrarAlerta('Campos incompletos', 'Completa todos los campos obligatorios.', 'error');
      return;
    }

    if (s.horaInicio >= s.horaFin) {
      this.mostrarAlerta('Hora inválida', 'La hora de inicio debe ser anterior a la hora de fin.', 'error');
      return;
    }

    this.guardando = true;

    // TODO: reemplazar con llamada real al backend
    // this.http.post('http://localhost:8080/solicitudes', s).subscribe(...)
    setTimeout(() => {
      const nueva: SolicitudReserva = {
        ...s,
        id: Date.now(),
        estado: 'PENDIENTE'
      };
      this.solicitudes.unshift(nueva);
      this.filtrar();
      this.guardando = false;
      this.cerrarModal();
      this.mostrarAlerta('¡Solicitud enviada!', 'Tu solicitud fue enviada y está pendiente de aprobación.', 'exito');
      this.cdr.detectChanges();
    }, 600);
  }

  /* =========================
     CANCELAR
  ==========================*/
  cancelarSolicitud(s: SolicitudReserva): void {
    this.accionPendiente = () => {
      // TODO: llamada al backend
      // this.http.patch(`http://localhost:8080/solicitudes/${s.id}/cancelar`, {}).subscribe(...)
      s.estado = 'RECHAZADA';
      this.filtrar();
      this.mostrarAlerta('Solicitud cancelada', 'La solicitud fue cancelada correctamente.', 'exito');
      this.cdr.detectChanges();
    };
    this.mostrarAlerta('¿Cancelar solicitud?', `¿Estás seguro de cancelar la reserva del ${s.laboratorio}?`, 'confirmar');
  }

  /* =========================
     EQUIPOS
  ==========================*/
  toggleEquipo(eq: { nombre: string }): void {
    const idx = this.solicitudActual.equipos.indexOf(eq.nombre);
    if (idx >= 0) {
      this.solicitudActual.equipos.splice(idx, 1);
    } else {
      this.solicitudActual.equipos.push(eq.nombre);
    }
  }

  equipoSeleccionado(eq: { nombre: string }): boolean {
    return this.solicitudActual.equipos.includes(eq.nombre);
  }

  /* =========================
     HELPERS
  ==========================*/
  getEstadoClass(estado?: string): string {
    switch (estado?.toUpperCase()) {
      case 'APROBADA':  return 'activo';
      case 'RECHAZADA': return 'inactivo';
      case 'PENDIENTE': return 'pendiente';
      default:          return 'pendiente';
    }
  }

  nuevaSolicitud(): SolicitudReserva {
    return {
      laboratorio: '',
      materia: '',
      fecha: '',
      horaInicio: '',
      horaFin: '',
      cantidadEstudiantes: null,
      equipos: [],
      motivo: '',
      estado: 'PENDIENTE'
    };
  }

  /* =========================
     NOTIFICACIONES
  ==========================*/
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
    if (this.accionPendiente) {
      this.accionPendiente();
      this.accionPendiente = null;
    }
    this.cdr.detectChanges();
  }

  /* =========================
     NAVEGACIÓN
  ==========================*/
  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  navegar(ruta: string): void {
    this.cerrarDrawer();
    this.router.navigate([`/${ruta}`]);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  toggleDrawer(): void  { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void  { this.drawerAbierto = false; }
}
