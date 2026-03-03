import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const PROPOSITOS = [
  { value: 'GENERAL',        label: 'General',                    icon: '📧' },
  { value: 'RECUPERACION',   label: 'Recuperación de contraseña', icon: '🔑' },
  { value: 'NOTIFICACIONES', label: 'Notificaciones del sistema', icon: '🔔' },
  { value: 'RESERVAS',       label: 'Alertas de reservas',        icon: '📅' },
  { value: 'REPORTES',       label: 'Reportes automáticos',       icon: '📊' },
];

const PRESETS: Record<string, any> = {
  GMAIL: {
    host: 'smtp.gmail.com', puerto: 587,
    sslHabilitado: false, starttlsHabilitado: true, protocolo: 'SMTP',
    nota: 'Requiere contraseña de aplicación (activa 2FA en tu cuenta Google)'
  },
  OUTLOOK: {
    host: 'smtp.office365.com', puerto: 587,
    sslHabilitado: false, starttlsHabilitado: true, protocolo: 'SMTP',
    nota: 'Usa tu contraseña normal de Microsoft'
  },
  YAHOO: {
    host: 'smtp.mail.yahoo.com', puerto: 465,
    sslHabilitado: true, starttlsHabilitado: false, protocolo: 'SMTP',
    nota: 'Requiere contraseña de aplicación de Yahoo'
  },
  HOTMAIL: {
    host: 'smtp.live.com', puerto: 587,
    sslHabilitado: false, starttlsHabilitado: true, protocolo: 'SMTP',
    nota: 'Misma configuración que Outlook'
  },
  CUSTOM: {
    host: '', puerto: 587,
    sslHabilitado: false, starttlsHabilitado: true, protocolo: 'SMTP',
    nota: 'Configura manualmente según tu proveedor SMTP'
  }
};

@Component({
  selector: 'app-configuracion-correo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion-correo.html',
  styleUrls: ['./configuracion-correo.scss']
})
export class ConfiguracionCorreoComponent implements OnInit {

  private readonly API = 'http://localhost:8080/configuracion-correo';

  drawerAbierto = false;
  usuarioLogueado = '';
  rol = '';

  configs: any[] = [];
  cargando = false;

  mostrarModal = false;
  modoModal: 'crear' | 'editar' = 'crear';
  guardando = false;
  probandoId: number | null = null;
  error = '';
  mostrarPassword = false;

  propositos = PROPOSITOS;
  proveedores = Object.keys(PRESETS);
  proveedorSeleccionado = 'GMAIL';
  notaPreset = PRESETS['GMAIL'].nota;

  configActual: any = this.configVacia();

  mostrarNotificacion = false;
  notificacionTitulo = '';
  notificacionMensaje = '';
  notificacionTipo: 'exito' | 'error' | 'confirmar' = 'exito';
  accionPendiente: (() => void) | null = null;

  constructor(private router: Router, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.rol = localStorage.getItem('rol') || '';
    this.usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';
    this.cargarConfigs();
  }

  configVacia(): any {
    return {
      idConfig: null, nombreDisplay: '', proposito: 'GENERAL', proveedor: 'GMAIL',
      host: 'smtp.gmail.com', puerto: 587, emailRemitente: '', passwordRemitente: '',
      nombreRemitente: 'CLAB Sistema', authHabilitado: true,
      starttlsHabilitado: true, sslHabilitado: false, protocolo: 'SMTP',
      timeoutMs: 5000, activo: true
    };
  }

  cargarConfigs(): void {
    this.cargando = true;
    this.http.get<any[]>(this.API).subscribe({
      next: (data) => { this.configs = data; this.cargando = false; this.cdr.detectChanges(); },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  abrirModalCrear(): void {
    this.modoModal = 'crear';
    this.configActual = this.configVacia();
    this.proveedorSeleccionado = 'GMAIL';
    this.notaPreset = PRESETS['GMAIL'].nota;
    this.error = '';
    this.mostrarPassword = false;
    this.mostrarModal = true;
  }

  abrirModalEditar(c: any): void {
    this.modoModal = 'editar';
    this.configActual = { ...c, passwordRemitente: '' };
    this.proveedorSeleccionado = c.proveedor || 'CUSTOM';
    this.notaPreset = PRESETS[this.proveedorSeleccionado]?.nota || '';
    this.error = '';
    this.mostrarPassword = false;
    this.mostrarModal = true;
  }

  cerrarModal(): void { this.mostrarModal = false; this.cdr.detectChanges(); }

  aplicarPreset(): void {
    const preset = PRESETS[this.proveedorSeleccionado];
    if (!preset) return;
    Object.assign(this.configActual, preset, { proveedor: this.proveedorSeleccionado });
    this.notaPreset = preset.nota;
    this.cdr.detectChanges();
  }

  onPuertoChange(): void {
    if (this.configActual.puerto === 465) {
      this.configActual.sslHabilitado = true;
      this.configActual.starttlsHabilitado = false;
    } else if (this.configActual.puerto === 587) {
      this.configActual.sslHabilitado = false;
      this.configActual.starttlsHabilitado = true;
    }
  }

  guardar(): void {
    if (!this.configActual.emailRemitente || !this.configActual.host || !this.configActual.nombreDisplay) {
      this.error = 'Nombre, host y email son obligatorios.';
      this.cdr.detectChanges();
      return;
    }
    if (this.modoModal === 'crear' && !this.configActual.passwordRemitente) {
      this.error = 'La contraseña es obligatoria al crear.';
      this.cdr.detectChanges();
      return;
    }

    this.guardando = true;
    this.error = '';

    const req$ = this.modoModal === 'editar'
      ? this.http.put<any>(`${this.API}/${this.configActual.idConfig}`, this.configActual)
      : this.http.post<any>(this.API, this.configActual);

    req$.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        this.cargarConfigs();
        this.mostrarAlerta(
          this.modoModal === 'crear' ? '¡Configuración creada!' : '¡Configuración actualizada!',
          `"${this.configActual.nombreDisplay}" fue guardada correctamente.`, 'exito');
      },
      error: (err) => {
        this.guardando = false;
        this.error = err.error?.error ?? 'Error al guardar.';
        this.cdr.detectChanges();
      }
    });
  }

  probarConfig(c: any): void {
    this.probandoId = c.idConfig;
    this.http.post(`${this.API}/${c.idConfig}/probar`, {}).subscribe({
      next: () => {
        this.probandoId = null;
        this.mostrarAlerta('✅ Prueba exitosa',
          `Correo de prueba enviado a ${c.emailRemitente}. Revisa tu bandeja.`, 'exito');
      },
      error: (err) => {
        this.probandoId = null;
        this.mostrarAlerta('❌ Fallo en prueba',
          err.error?.error ?? 'No se pudo conectar al servidor SMTP.', 'error');
      }
    });
  }

  cambiarEstado(c: any): void {
    const nuevoEstado = !c.activo;
    this.http.patch(`${this.API}/${c.idConfig}/estado?activo=${nuevoEstado}`, {}).subscribe({
      next: () => { c.activo = nuevoEstado; this.cdr.detectChanges(); },
      error: () => this.mostrarAlerta('Error', 'No se pudo cambiar el estado.', 'error')
    });
  }

  confirmarEliminar(c: any): void {
    this.accionPendiente = () => {
      this.http.delete(`${this.API}/${c.idConfig}`).subscribe({
        next: () => { this.cargarConfigs(); this.mostrarAlerta('Eliminado', `"${c.nombreDisplay}" eliminado.`, 'exito'); },
        error: () => this.mostrarAlerta('Error', 'No se pudo eliminar.', 'error')
      });
    };
    this.mostrarAlerta('¿Eliminar configuración?', `¿Eliminar "${c.nombreDisplay}"?`, 'confirmar');
  }

  getLabelProposito(v: string): string { return this.propositos.find(p => p.value === v)?.label ?? v; }
  getIconProposito(v: string): string { return this.propositos.find(p => p.value === v)?.icon ?? '📧'; }
  getProtocoloBadge(c: any): string {
    if (c.sslHabilitado) return 'SSL 465';
    if (c.starttlsHabilitado) return 'TLS 587';
    return 'SMTP';
  }

  mostrarAlerta(titulo: string, mensaje: string, tipo: 'exito' | 'error' | 'confirmar'): void {
    this.notificacionTitulo = titulo;
    this.notificacionMensaje = mensaje;
    this.notificacionTipo = tipo;
    this.mostrarNotificacion = true;
    this.cdr.detectChanges();
    if (tipo !== 'confirmar') setTimeout(() => { this.mostrarNotificacion = false; this.cdr.detectChanges(); }, 4000);
  }

  cerrarNotificacion(): void { this.mostrarNotificacion = false; this.accionPendiente = null; this.cdr.detectChanges(); }
  confirmarAccion(): void {
    this.mostrarNotificacion = false;
    if (this.accionPendiente) { this.accionPendiente(); this.accionPendiente = null; }
    this.cdr.detectChanges();
  }

  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }
  navegar(ruta: string): void { this.cerrarDrawer(); this.router.navigate([`/${ruta}`]); }
  volver(): void { this.router.navigate(['/dashboard']); }
  logout(): void { localStorage.clear(); this.router.navigate(['/login']); }
}
