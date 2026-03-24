import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuditoriaItem, SesionActivaItem } from '../interfaces/Auditoria.model';

const API = 'http://localhost:8080';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditoria.html',
  styleUrls: ['./auditoria.scss']
})
export class AuditoriaComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  tabActiva = 0;
  subTabActiva = 0;
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
  itemsPorPagina = 30;
  totalPaginas = 1;

  forzandoLogout: number | null = null;
  sesionAForzar: SesionActivaItem | null = null;
  modalForzarAbierto = false;
  modalErrorAbierto = false;
  modalErrorMensaje = '';

  modalDetalleAbierto = false;
  auditoriaDetalle: AuditoriaItem | null = null;

  // Stats BD
  statsBD: any = null;
  private intervaloStats: any = null;
  private intervaloConexiones: any = null;
  private chartsInicializados = false;

  // Historial queries — filtro y orden
  busquedaHistorial = '';
  ordenHistorial = 'tiempo';
  historialFiltrado: any[] = [];

  readonly modulos = ['AUTH', 'USUARIOS', 'ROLES', 'EQUIPOS', 'LABORATORIOS', 'RESERVAS', 'HORARIOS', 'REPORTES'];

  ngOnInit(): void {
    this.rol = localStorage.getItem('rol') || '';
    const userData = localStorage.getItem('usuario') || localStorage.getItem('user');
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
    this.cargarStatsBD();
    this.intervaloStats = setInterval(() => this.cargarStatsBD(), 10000);
  }

  ngOnDestroy(): void {
    if (this.intervaloStats) clearInterval(this.intervaloStats);
    if (this.intervaloConexiones) clearInterval(this.intervaloConexiones);
  }

  private iniciarIntervaloRapido(): void {
    if (this.intervaloConexiones) return;
    this.intervaloConexiones = setInterval(() => this.cargarSoloConexiones(), 2000);
  }

  private detenerIntervaloRapido(): void {
    if (this.intervaloConexiones) {
      clearInterval(this.intervaloConexiones);
      this.intervaloConexiones = null;
    }
  }

  cargarSoloConexiones(): void {
    this.http.get<any>(`${API}/auditoria/stats-bd`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        if (this.statsBD) {
          this.statsBD.conexionesActivas = data.conexionesActivas;
          this.statsBD.bloqueos = data.bloqueos;
        }
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
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

  cargarStatsBD(): void {
    this.http.get<any>(`${API}/auditoria/stats-bd`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.chartsInicializados = false;
        this.statsBD = data;
        this.filtrarHistorial();
        this.cdr.detectChanges();
        setTimeout(() => this.inicializarGraficos(), 150);
      },
      error: err => console.error('Error cargando stats BD', err)
    });
  }

  filtrarHistorial(): void {
    if (!this.statsBD?.historialQueries) {
      this.historialFiltrado = [];
      return;
    }

    const texto = this.busquedaHistorial.toLowerCase().trim();

    let resultado = this.statsBD.historialQueries.filter((q: any[]) =>
      !texto || (q[0] || '').toLowerCase().includes(texto)
    );

    // Ordenar
    switch (this.ordenHistorial) {
      case 'llamadas':
        resultado = resultado.sort((a: any[], b: any[]) => (b[1] || 0) - (a[1] || 0));
        break;
      case 'promedio':
        resultado = resultado.sort((a: any[], b: any[]) => (b[3] || 0) - (a[3] || 0));
        break;
      case 'filas':
        resultado = resultado.sort((a: any[], b: any[]) => (b[4] || 0) - (a[4] || 0));
        break;
      case 'tiempo':
      default:
        resultado = resultado.sort((a: any[], b: any[]) => (b[2] || 0) - (a[2] || 0));
        break;
    }

    this.historialFiltrado = resultado;
  }

  inicializarGraficos(): void {
    if (this.chartsInicializados || !this.statsBD || this.tabActiva !== 2) return;

    const Chart = (window as any).Chart;
    if (!Chart) return;

    ['chartActividad', 'chartCommits', 'chartCache', 'chartTamanio'].forEach(id => {
      const canvas = document.getElementById(id) as HTMLCanvasElement;
      if (canvas) {
        const existing = Chart.getChart(canvas);
        if (existing) existing.destroy();
      }
    });

    const verde    = '#39ff14';
    const azul     = '#00bcd4';
    const rojo     = '#ff4444';
    const morado   = '#b388ff';
    const gridColor = 'rgba(255,255,255,0.05)';
    const tickColor = '#555';

    const tablas = this.statsBD.tablasActivas || [];
    const labels = tablas.map((t: any[]) => t[1]);

    const ctxAct = document.getElementById('chartActividad') as HTMLCanvasElement;
    if (ctxAct) {
      new Chart(ctxAct, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Inserts', data: tablas.map((t: any[]) => t[2]), backgroundColor: verde + 'bb', borderRadius: 4 },
            { label: 'Updates', data: tablas.map((t: any[]) => t[3]), backgroundColor: azul + 'bb', borderRadius: 4 },
            { label: 'Deletes', data: tablas.map((t: any[]) => t[4]), backgroundColor: rojo + 'bb', borderRadius: 4 },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#888', font: { size: 11 }, boxWidth: 12 } } },
          scales: {
            x: { ticks: { color: tickColor, font: { size: 9 } }, grid: { color: gridColor } },
            y: { ticks: { color: tickColor, font: { size: 10 } }, grid: { color: gridColor } }
          }
        }
      });
    }

    const ctxCom = document.getElementById('chartCommits') as HTMLCanvasElement;
    if (ctxCom) {
      new Chart(ctxCom, {
        type: 'doughnut',
        data: {
          labels: ['Commits', 'Rollbacks'],
          datasets: [{
            data: [this.statsBD.transaccionesCommit, this.statsBD.transaccionesRollback],
            backgroundColor: [verde + 'cc', rojo + 'cc'],
            borderColor: ['#0d0d0d'],
            borderWidth: 3,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '68%',
          plugins: { legend: { position: 'bottom', labels: { color: '#888', font: { size: 11 }, padding: 16 } } }
        }
      });
    }

    const ctxCache = document.getElementById('chartCache') as HTMLCanvasElement;
    if (ctxCache) {
      const ratio = parseFloat(this.statsBD.cacheHitRatio) || 0;
      new Chart(ctxCache, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [ratio, 100 - ratio],
            backgroundColor: [azul + 'ee', '#1c1c1c'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          circumference: 180, rotation: -90, cutout: '72%',
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c: any) => c.dataIndex === 0 ? `${ratio}%` : `${(100 - ratio).toFixed(2)}% libre` } }
          }
        }
      });
    }

    const ctxTam = document.getElementById('chartTamanio') as HTMLCanvasElement;
    if (ctxTam) {
      const parseSize = (s: string) => {
        if (!s) return 0;
        const n = parseFloat(s);
        if (s.includes('MB')) return n * 1024;
        if (s.includes('GB')) return n * 1024 * 1024;
        return n;
      };
      new Chart(ctxTam, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Tamaño (kB)',
            data: tablas.map((t: any[]) => parseSize(t[6])),
            backgroundColor: morado + 'bb',
            borderRadius: 4
          }]
        },
        options: {
          indexAxis: 'y' as const,
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: tickColor, font: { size: 10 }, callback: (v: any) => v + ' kB' }, grid: { color: gridColor } },
            y: { ticks: { color: tickColor, font: { size: 9 } }, grid: { color: gridColor } }
          }
        }
      });
    }

    this.chartsInicializados = true;
  }

  forzarLogout(sesion: SesionActivaItem): void {
    const miId = localStorage.getItem('idUsuario');
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
    if (index === 2) {
      this.subTabActiva = 0;
      this.chartsInicializados = false;
      this.cargarStatsBD();
      this.iniciarIntervaloRapido();
    } else {
      this.detenerIntervaloRapido();
    }
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
    else if (this.tabActiva === 1) this.cargarSesiones();
    else this.cargarStatsBD();
  }
  logout(): void { localStorage.clear(); this.router.navigate(['/login']); }

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
