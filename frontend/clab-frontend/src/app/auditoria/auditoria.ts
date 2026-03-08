import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const API = 'http://localhost:8080';

export interface AuditoriaItem {
  idAuditoria?: number;
  idUsuario?: number;
  usuario?: string;
  accion: string;
  modulo?: string;
  tablaAfectada?: string;
  descripcion?: string;
  ip?: string;
  resultado?: string;
  fechaHora?: string;
  datosAnteriores?: string; // ← nuevo
  datosNuevos?: string;
}

export interface SesionActivaItem {
  idSesion?: number;
  idUsuario?: number;
  usuario: string;
  ip?: string;
  fechaInicio?: string;
  fechaExpira?: string;
  activa?: boolean;
}

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditoria.html',
  styleUrls: ['./auditoria.scss']
})
export class AuditoriaComponent implements OnInit {

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  tabActiva = 0;
  drawerAbierto = false;
  usuarioLogueado = '';
  rol = '';

  auditorias: AuditoriaItem[] = [];
  auditoriasFiltradas: AuditoriaItem[] = [];
  auditoriasPaginadas: AuditoriaItem[] = [];
  sesionesActivas: SesionActivaItem[] = [];

  busqueda = '';
  filtroModulo = 'Todos';
  filtroResultado = 'Todos';

  paginaActual = 1;
  itemsPorPagina = 15;
  totalPaginas = 1;

  forzandoLogout: number | null = null; // idUsuario en proceso
  sesionAForzar: SesionActivaItem | null = null;
  modalForzarAbierto = false;
  modalErrorAbierto = false;
  modalErrorMensaje = '';

  modalDetalleAbierto = false;
  auditoriaDetalle: AuditoriaItem | null = null;

  readonly modulos = ['AUTH', 'USUARIOS', 'ROLES', 'EQUIPOS', 'LABORATORIOS', 'RESERVAS', 'HORARIOS', 'REPORTES'];

  ngOnInit(): void {
    this.rol = sessionStorage.getItem('rol') || '';
    const userData = sessionStorage.getItem('usuario') || sessionStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        this.usuarioLogueado = parsed.nombres
          ? `${parsed.nombres} ${parsed.apellidos}`
          : parsed.email || 'Usuario';
      } catch { this.usuarioLogueado = 'Usuario'; }
    }

    this.cargarAuditorias();
    this.cargarSesiones();
  }

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  cargarAuditorias(): void {
    this.http.get<AuditoriaItem[]>(`${API}/auditoria/listar`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.auditorias = data;
        this.filtrar();
        this.cdr.detectChanges();
      },
      error: err => console.error('Error cargando auditoría', err)
    });
  }

  cargarSesiones(): void {
    this.http.get<SesionActivaItem[]>(`${API}/auditoria/sesiones-activas`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.sesionesActivas = data;
        this.cdr.detectChanges();
      },
      error: err => console.error('Error cargando sesiones', err)
    });
  }

  forzarLogout(sesion: SesionActivaItem): void {
    const miId = sessionStorage.getItem('idUsuario');
    if (miId && sesion.idUsuario === parseInt(miId)) {
      this.modalErrorMensaje = 'No puedes cerrar tu propia sesión desde aquí.';
      this.modalErrorAbierto = true;
      return;
    }
    this.sesionAForzar = sesion;
    this.modalForzarAbierto = true;
  }

  cancelarForzar(): void {
    this.sesionAForzar = null;
    this.modalForzarAbierto = false;
  }

  confirmarForzar(): void {
    if (!this.sesionAForzar?.idUsuario) return;
    this.forzandoLogout = this.sesionAForzar.idUsuario;

    this.http.post(
      `${API}/auditoria/forzar-logout/${this.sesionAForzar.idUsuario}`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.forzandoLogout = null;
        this.modalForzarAbierto = false;
        this.sesionAForzar = null;
        this.cargarSesiones();
        this.cdr.detectChanges();
      },
      error: () => {
        this.forzandoLogout = null;
        this.modalForzarAbierto = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrar(): void {
    const texto = this.busqueda.toLowerCase();
    this.auditoriasFiltradas = this.auditorias.filter(a =>
      (`${a.usuario} ${a.accion} ${a.modulo} ${a.descripcion}`.toLowerCase().includes(texto)) &&
      (this.filtroModulo === 'Todos' || a.modulo === this.filtroModulo) &&
      (this.filtroResultado === 'Todos' || a.resultado === this.filtroResultado)
    );
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  actualizarPaginacion(): void {
    this.totalPaginas = Math.max(1, Math.ceil(this.auditoriasFiltradas.length / this.itemsPorPagina));
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    this.auditoriasPaginadas = this.auditoriasFiltradas.slice(inicio, inicio + this.itemsPorPagina);
    this.cdr.detectChanges();
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }

  get paginas(): number[] {
    const rango = 5;
    const mitad = Math.floor(rango / 2);
    let inicio = Math.max(1, this.paginaActual - mitad);
    let fin = Math.min(this.totalPaginas, inicio + rango - 1);
    if (fin - inicio < rango - 1) inicio = Math.max(1, fin - rango + 1);
    return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
  }

  get totalExitosos(): number { return this.auditorias.filter(a => a.resultado === 'EXITOSO').length; }
  get totalFallidos(): number { return this.auditorias.filter(a => a.resultado === 'FALLIDO').length; }

  cambiarTab(index: number): void {
    this.tabActiva = index;
    if (index === 1) this.cargarSesiones();
  }

  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }
  volver(): void { this.router.navigate(['/dashboard']); }
  navegar(ruta: string, mensaje: string = '') {
    console.log(mensaje);
    this.router.navigate([ruta]);
  }
  actualizar(): void {
    if (this.tabActiva === 0) this.cargarAuditorias();
    else this.cargarSesiones();
  }
  logout(): void { sessionStorage.clear(); this.router.navigate(['/login']); }

  verDetalle(a: AuditoriaItem): void {
    this.auditoriaDetalle = a;
    this.modalDetalleAbierto = true;
  }

  cerrarDetalle(): void {
    this.modalDetalleAbierto = false;
    this.auditoriaDetalle = null;
  }

  parsearJSON(texto?: string): Record<string, string> | null {
    if (!texto) return null;
    try { return JSON.parse(texto); } catch { return null; }
  }

  tieneDetalle(a: AuditoriaItem): boolean {
    return !!(a.datosAnteriores || a.datosNuevos);
  }
}
