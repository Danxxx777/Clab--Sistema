import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface BackupHistorial {
  id: number;
  fecha: string;
  tipo: 'MANUAL' | 'AUTOMATICO';
  estado: 'EXITOSO' | 'FALLIDO';
  tamano?: string;
  rutaLocal?: string;
  rutaDrive?: string;
  error?: string;
}

export interface BackupConfig {
  frecuencia: 'DIARIO' | 'SEMANAL' | 'MENSUAL';
  hora: string;
  diaSemana?: string;
  diaMes?: number;
  guardarLocal: boolean;
  guardarDrive: boolean;
  activo: boolean;
}

@Component({
  selector: 'app-backup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './backup.html',
  styleUrls: ['./backup.scss']
})
export class BackupComponent implements OnInit {

  private baseUrl = 'http://localhost:8080/backup';

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  // ── Estado general ────────────────────────────────────────────────────────
  usuarioLogueado = '';
  rol = '';
  drawerAbierto = false;

  // ── Toast ─────────────────────────────────────────────────────────────────
  mostrarNotificacion = false;
  notificacionTitulo = '';
  notificacionMensaje = '';
  notificacionTipo: 'exito' | 'error' | 'confirmar' = 'exito';

  // ── Stats ─────────────────────────────────────────────────────────────────
  totalBackups = 0;
  backupsExitosos = 0;
  backupsFallidos = 0;
  ultimoBackup = '';

  // ── Backup manual ─────────────────────────────────────────────────────────
  ejecutando = false;
  mensajeManual = '';
  errorManual = false;

  // ── Configuración ─────────────────────────────────────────────────────────
  guardandoConfig = false;
  mensajeConfig = '';
  errorConfig = false;

  config: BackupConfig = {
    frecuencia:   'DIARIO',
    hora:         '02:00',
    diaSemana:    'MONDAY',
    diaMes:       1,
    guardarLocal: true,
    guardarDrive: true,
    activo:       false
  };

  // ── Historial ─────────────────────────────────────────────────────────────
  historial: BackupHistorial[] = [];
  historialFiltrado: BackupHistorial[] = [];
  filtroTipo   = 'TODOS';
  filtroEstado = 'TODOS';

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.rol = sessionStorage.getItem('rol') || '';

    const userData = sessionStorage.getItem('usuario') || sessionStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        this.usuarioLogueado = parsed.nombres
          ? `${parsed.nombres} ${parsed.apellidos}`
          : parsed.usuario || 'Usuario';
      } catch {
        this.usuarioLogueado = userData;
      }
    }

    this.cargarConfiguracion();
    this.cargarHistorial();
  }

  // ── Navegación ────────────────────────────────────────────────────────────
  volver(): void { this.router.navigate(['/dashboard']); }
  navegar(ruta: string): void { this.cerrarDrawer(); this.router.navigate([`/${ruta}`]); }
  logout(): void { sessionStorage.clear(); this.router.navigate(['/login']); }
  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }

  // ── Cargar configuración ──────────────────────────────────────────────────
  cargarConfiguracion(): void {
    this.http.get<BackupConfig>(`${this.baseUrl}/configuracion`).subscribe({
      next: (data) => {
        this.config = data;
        this.cdr.detectChanges();
      },
      error: () => {} // Si no existe config, usa los defaults
    });
  }

  // ── Guardar configuración ─────────────────────────────────────────────────
  guardarConfiguracion(): void {
    this.mensajeConfig = '';
    this.errorConfig = false;
    this.guardandoConfig = true;

    this.http.post(`${this.baseUrl}/configurar`, this.config).subscribe({
      next: () => {
        this.guardandoConfig = false;
        this.mensajeConfig = 'Configuración guardada correctamente.';
        this.errorConfig = false;
        this.cdr.detectChanges();
        setTimeout(() => { this.mensajeConfig = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.guardandoConfig = false;
        this.mensajeConfig = err.error?.message || 'No se pudo guardar la configuración.';
        this.errorConfig = true;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Toggle schedule activo/inactivo ───────────────────────────────────────
  toggleSchedule(): void {
    this.config.activo = !this.config.activo;
  }

  // ── Ejecutar backup manual ────────────────────────────────────────────────
  ejecutarBackupManual(): void {
    this.mensajeManual = '';
    this.errorManual = false;
    this.ejecutando = true;
    this.cdr.detectChanges();

    this.http.post<any>(`${this.baseUrl}/ejecutar`, {}).subscribe({
      next: () => {
        this.ejecutando = false;
        this.mensajeManual = 'Backup completado exitosamente.';
        this.errorManual = false;
        this.cargarHistorial();
        this.mostrarAlerta('Backup completado', 'El respaldo se generó y guardó correctamente.', 'exito');
        this.cdr.detectChanges();
        setTimeout(() => { this.mensajeManual = ''; this.cdr.detectChanges(); }, 4000);
      },
      error: (err) => {
        this.ejecutando = false;
        this.mensajeManual = err.error?.message || 'Error al ejecutar el backup.';
        this.errorManual = true;
        this.mostrarAlerta('Error en backup', this.mensajeManual, 'error');
        this.cdr.detectChanges();
      }
    });
  }

  // ── Cargar historial ──────────────────────────────────────────────────────
  cargarHistorial(): void {
    this.http.get<BackupHistorial[]>(`${this.baseUrl}/historial`).subscribe({
      next: (data) => {
        this.historial = data;
        this.calcularStats();
        this.filtrarHistorial();
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  // ── Calcular stats ────────────────────────────────────────────────────────
  calcularStats(): void {
    this.totalBackups     = this.historial.length;
    this.backupsExitosos  = this.historial.filter(b => b.estado === 'EXITOSO').length;
    this.backupsFallidos  = this.historial.filter(b => b.estado === 'FALLIDO').length;

    if (this.historial.length > 0) {
      const ultimo = this.historial[0];
      const fecha = new Date(ultimo.fecha);
      this.ultimoBackup = fecha.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: '2-digit' });
    }
  }

  // ── Filtrar historial ─────────────────────────────────────────────────────
  filtrarHistorial(): void {
    this.historialFiltrado = this.historial.filter(b => {
      const pasaTipo   = this.filtroTipo   === 'TODOS' || b.tipo   === this.filtroTipo;
      const pasaEstado = this.filtroEstado === 'TODOS' || b.estado === this.filtroEstado;
      return pasaTipo && pasaEstado;
    });
  }

  // ── Descargar backup ──────────────────────────────────────────────────────
  descargarBackup(b: BackupHistorial): void {
    if (!b.rutaLocal) return;

    this.http.get(`${this.baseUrl}/descargar/${b.id}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url  = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href  = url;
        link.download = `backup_${b.id}_${new Date(b.fecha).toISOString().slice(0,10)}.sql`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.mostrarAlerta('Error', 'No se pudo descargar el archivo de backup.', 'error');
      }
    });
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  mostrarAlerta(titulo: string, mensaje: string, tipo: 'exito' | 'error' | 'confirmar'): void {
    this.notificacionTitulo  = titulo;
    this.notificacionMensaje = mensaje;
    this.notificacionTipo    = tipo;
    this.mostrarNotificacion = true;
    this.cdr.detectChanges();

    if (tipo !== 'confirmar') {
      setTimeout(() => {
        this.mostrarNotificacion = false;
        this.cdr.detectChanges();
      }, 3500);
    }
  }

  cerrarNotificacion(): void {
    this.mostrarNotificacion = false;
    this.cdr.detectChanges();
  }
}
