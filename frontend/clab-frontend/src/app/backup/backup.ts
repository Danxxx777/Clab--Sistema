import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BackupService, BackupConfig, BackupRegistro } from '../services/backup.service';

@Component({
  selector: 'app-backup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './backup.html',
  styleUrls: ['./backup.scss']
})
export class BackupComponent implements OnInit {

  Math = Math;

  constructor(
    private router:        Router,
    private backupService: BackupService,
    private cdr:           ChangeDetectorRef
  ) {}

  // Estado general
  usuarioLogueado = '';
  rol             = '';
  drawerAbierto   = false;

  //Toast
  mostrarNotificacion  = false;
  notificacionTitulo   = '';
  notificacionMensaje  = '';
  notificacionTipo: 'exito' | 'error' | 'confirmar' = 'exito';

  // Stats
  totalBackups     = 0;
  backupsExitosos  = 0;
  backupsFallidos  = 0;
  ultimoBackup     = '';
  estadoUltimoBackup: 'ok' | 'warn' | 'danger' = 'ok';

  // Backup manual
  ejecutando    = false;
  mensajeManual = '';
  errorManual   = false;

  //Configuración
  guardandoConfig = false;
  mensajeConfig   = '';
  errorConfig     = false;

  config: BackupConfig = {
    frecuencia:       'DIARIO',
    horas:            ['02:00'],
    diasSemana:       [],
    diasMes:          [],
    guardarLocal:     true,
    guardarDrive:     false,
    activo:           false,
    diasRetencion:    30,
    rutaLocalBackup:  'C:/backups',
    modalidadDefault: 'COMPLETO'
  };

  // Modalidad del backup manual
  modalidadManual: 'COMPLETO' | 'DIFERENCIAL' | 'INCREMENTAL' = 'COMPLETO';

  // Próximo backup
  proximoBackupTexto = '';

  // Historial
  historial:         BackupRegistro[] = [];
  historialFiltrado: BackupRegistro[] = [];
  filtroTipo         = 'TODOS';
  filtroEstado       = 'TODOS';

  // Paginación
  paginaActual       = 1;
  itemsPorPagina     = 8;
  totalPaginas       = 1;
  historialPaginado: BackupRegistro[] = [];
  paginasVisibles:   number[]         = [];

  //Error expandido
  errorExpandido: number | null = null;

  // Lifecycle
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

  //Navegación
  volver():              void { this.router.navigate(['/dashboard']); }
  navegar(ruta: string): void { this.cerrarDrawer(); this.router.navigate([`/${ruta}`]); }
  logout():              void { sessionStorage.clear(); this.router.navigate(['/login']); }
  toggleDrawer():        void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer():        void { this.drawerAbierto = false; }

  // Cargar configuración
  cargarConfiguracion(): void {
    this.backupService.obtenerConfiguracion().subscribe({
      next: (data) => {

        this.config = {
          ...data,
          horas:           data.horas       || ['02:00'],
          diasSemana:      data.diasSemana   || [],
          diasMes:         data.diasMes      || [],
          rutaLocalBackup: data.rutaLocalBackup || 'C:/backups'
        };
        this.actualizarProximoBackup();
        this.cdr.detectChanges();
      },
      error: () => this.actualizarProximoBackup()
    });
  }

  // Guardar configuración
  guardarConfiguracion(): void {
    this.mensajeConfig   = '';
    this.errorConfig     = false;
    this.guardandoConfig = true;

    this.backupService.guardarConfiguracion(this.config).subscribe({
      next: () => {
        this.guardandoConfig = false;
        this.mensajeConfig   = 'Configuración guardada correctamente.';
        this.errorConfig     = false;
        this.actualizarProximoBackup();
        this.cdr.detectChanges();
        setTimeout(() => { this.mensajeConfig = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.guardandoConfig = false;
        this.mensajeConfig   = err.message || 'No se pudo guardar la configuración.';
        this.errorConfig     = true;
        this.cdr.detectChanges();
      }
    });
  }

  // Toggle schedule
  toggleSchedule(): void {
    this.config.activo = !this.config.activo;
    this.actualizarProximoBackup();
  }

  // Ejecutar backup manual
  ejecutarBackupManual(): void {
    this.mensajeManual = '';
    this.errorManual   = false;
    this.ejecutando    = true;
    this.cdr.detectChanges();

    this.backupService.ejecutarBackupManual(this.modalidadManual).subscribe({
      next: (respuesta) => {
        this.ejecutando    = false;
        this.mensajeManual = respuesta.mensaje;
        this.errorManual   = false;
        this.cargarHistorial();
        this.mostrarAlerta('Backup completado', respuesta.detalle || respuesta.mensaje, 'exito');
        this.cdr.detectChanges();
        setTimeout(() => { this.mensajeManual = ''; this.cdr.detectChanges(); }, 4000);
      },
      error: (err) => {
        this.ejecutando    = false;
        this.mensajeManual = err.message || 'Error al ejecutar el backup.';
        this.errorManual   = true;
        this.mostrarAlerta('Error en backup', this.mensajeManual, 'error');
        this.cdr.detectChanges();
      }
    });
  }
  // Cargar historial
  cargarHistorial(): void {
    this.backupService.obtenerHistorial().subscribe({
      next: (data) => {
        this.historial = data;
        this.calcularStats();
        this.filtrarHistorial();
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  //Stats
  calcularStats(): void {
    this.totalBackups    = this.historial.length;
    this.backupsExitosos = this.historial.filter(b => b.estado === 'EXITOSO').length;
    this.backupsFallidos = this.historial.filter(b => b.estado === 'FALLIDO').length;

    if (this.historial.length > 0) {
      const ultimo = this.historial[0];
      const fecha  = new Date(ultimo.fecha);
      this.ultimoBackup = fecha.toLocaleDateString('es-EC', {
        day: '2-digit', month: '2-digit', year: '2-digit'
      });
      this.calcularEstadoAlertaBackup(ultimo, fecha);
    } else {
      this.estadoUltimoBackup = 'danger';
    }
  }

  private calcularEstadoAlertaBackup(ultimo: BackupRegistro, fecha: Date): void {
    const diffHoras = (new Date().getTime() - fecha.getTime()) / (1000 * 60 * 60);
    if (ultimo.estado === 'FALLIDO' || diffHoras > 72) {
      this.estadoUltimoBackup = 'danger';
    } else if (diffHoras > 24) {
      this.estadoUltimoBackup = 'warn';
    } else {
      this.estadoUltimoBackup = 'ok';
    }
  }

  // Filtrar historial
  filtrarHistorial(): void {
    this.historialFiltrado = this.historial.filter(b => {
      const pasaTipo   = this.filtroTipo   === 'TODOS' || b.tipo   === this.filtroTipo;
      const pasaEstado = this.filtroEstado === 'TODOS' || b.estado === this.filtroEstado;
      return pasaTipo && pasaEstado;
    });
    this.paginaActual   = 1;
    this.errorExpandido = null;
    this.calcularPaginacion();
  }

  // Paginación
  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.historialFiltrado.length / this.itemsPorPagina);
    if (this.totalPaginas < 1) this.totalPaginas = 1;
    this.actualizarPaginaActual();
    this.calcularPaginasVisibles();
  }

  actualizarPaginaActual(): void {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    this.historialPaginado = this.historialFiltrado.slice(inicio, inicio + this.itemsPorPagina);
  }

  calcularPaginasVisibles(): void {
    const total  = this.totalPaginas;
    const actual = this.paginaActual;
    const paginas: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) paginas.push(i);
    } else {
      paginas.push(1);
      if (actual > 3) paginas.push(-1);
      const inicio = Math.max(2, actual - 1);
      const fin    = Math.min(total - 1, actual + 1);
      for (let i = inicio; i <= fin; i++) paginas.push(i);
      if (actual < total - 2) paginas.push(-1);
      paginas.push(total);
    }
    this.paginasVisibles = paginas;
  }

  irPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual   = pagina;
    this.errorExpandido = null;
    this.actualizarPaginaActual();
    this.calcularPaginasVisibles();
    this.cdr.detectChanges();
  }

  //Próximo backup
  actualizarProximoBackup(): void {
    if (!this.config.activo || !this.config.horas?.length) {
      this.proximoBackupTexto = '';
      return;
    }

    const ahora = new Date();
    const horas = [...this.config.horas].sort();
    let proxima: Date | null = null;

    for (const hora of horas) {
      const [hh, mm] = hora.split(':').map(Number);
      const candidata = new Date();
      candidata.setHours(hh, mm, 0, 0);

      if (this.config.frecuencia === 'DIARIO') {
        if (candidata > ahora) { proxima = candidata; break; }

      } else if (this.config.frecuencia === 'SEMANAL') {
        const diasSemana: Record<string, number> = {
          SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
          THURSDAY: 4, FRIDAY: 5, SATURDAY: 6
        };
        for (const dia of this.config.diasSemana) {
          const diaNum    = diasSemana[dia];
          let   diasHasta = (diaNum - ahora.getDay() + 7) % 7;
          if (diasHasta === 0 && candidata <= ahora) diasHasta = 7;
          const c = new Date(candidata);
          c.setDate(c.getDate() + diasHasta);
          if (!proxima || c < proxima) proxima = c;
        }

      } else if (this.config.frecuencia === 'MENSUAL') {
        for (const dia of this.config.diasMes) {
          const c = new Date(candidata);
          c.setDate(dia);
          if (c <= ahora) c.setMonth(c.getMonth() + 1);
          if (!proxima || c < proxima) proxima = c;
        }
      }
    }

    if (!proxima && this.config.frecuencia === 'DIARIO' && horas.length > 0) {
      const [hh, mm] = horas[0].split(':').map(Number);
      proxima = new Date();
      proxima.setDate(proxima.getDate() + 1);
      proxima.setHours(hh, mm, 0, 0);
    }

    if (proxima) {
      this.proximoBackupTexto = proxima.toLocaleDateString('es-EC', {
        weekday: 'short', day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit', hour12: false
      });
    }
    this.cdr.detectChanges();
  }

  // Descargar backup
  descargarBackup(b: BackupRegistro): void {
    if (!b.rutaLocal) return;

    this.backupService.descargarBackup(b.id).subscribe({
      next: (blob) => {
        const url  = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href  = url;
        link.download = `backup_${b.id}_${new Date(b.fecha).toISOString().slice(0, 10)}.sql`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.mostrarAlerta('Error', 'No se pudo descargar el archivo de backup.', 'error');
      }
    });
  }

  // opciones para los selectores múltiples
  diasSemanaOpciones = [
    { valor: 'MONDAY',    label: 'Lun' },
    { valor: 'TUESDAY',   label: 'Mar' },
    { valor: 'WEDNESDAY', label: 'Mié' },
    { valor: 'THURSDAY',  label: 'Jue' },
    { valor: 'FRIDAY',    label: 'Vie' },
    { valor: 'SATURDAY',  label: 'Sáb' },
    { valor: 'SUNDAY',    label: 'Dom' }
  ];

  diasMesOpciones = Array.from({ length: 28 }, (_, i) => i + 1); // [1..28]

  nuevaHora = '08:00'; // Valor del input de nueva hora

  // Toggles para días y horas múltiples
  toggleDiaSemana(dia: string): void {
    const idx = this.config.diasSemana.indexOf(dia);
    if (idx === -1) {
      this.config.diasSemana = [...this.config.diasSemana, dia];
    } else {
      this.config.diasSemana = this.config.diasSemana.filter(d => d !== dia);
    }
    this.actualizarProximoBackup();
  }

  toggleDiaMes(dia: number): void {
    const idx = this.config.diasMes.indexOf(dia);
    if (idx === -1) {
      this.config.diasMes = [...this.config.diasMes, dia].sort((a, b) => a - b);
    } else {
      this.config.diasMes = this.config.diasMes.filter(d => d !== dia);
    }
    this.actualizarProximoBackup();
  }

  agregarHora(): void {
    if (!this.nuevaHora) return;
    if (this.config.horas.includes(this.nuevaHora)) return; // No duplicados
    this.config.horas = [...this.config.horas, this.nuevaHora].sort();
    this.actualizarProximoBackup();
  }

  removerHora(index: number): void {
    if (this.config.horas.length <= 1) return; // Mínimo 1 hora siempre
    this.config.horas = this.config.horas.filter((_, i) => i !== index);
    this.actualizarProximoBackup();
  }

  // Toggle error expandido
  toggleError(b: BackupRegistro): void {
    this.errorExpandido = this.errorExpandido === b.id ? null : b.id;
    this.cdr.detectChanges();
  }

  // Toast
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
