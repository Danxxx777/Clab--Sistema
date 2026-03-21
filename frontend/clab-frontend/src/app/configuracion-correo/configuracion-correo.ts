import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const PROPOSITOS = [
  { value: 'GENERAL',        label: 'General',                    icon: '📧' },
  { value: 'RECUPERACION',   label: 'Recuperación de contraseña', icon: '🔑' },
  { value: 'NOTIFICACIONES', label: 'Notificaciones del sistema', icon: '🔔' },
  { value: 'RESERVAS',       label: 'Alertas de reservas',        icon: '📅' },
  { value: 'REPORTES',       label: 'Reportes automáticos',       icon: '📊' },
  { value: 'RESPUESTAS',     label: 'Respuestas a usuarios',      icon: '💬' },
];

const PRESETS: Record<string, any> = {
  GMAIL: {
    host: 'smtp.gmail.com', puerto: 587,
    sslHabilitado: false, starttlsHabilitado: true, protocolo: 'SMTP',
    nota: 'Requiere contraseña de aplicación (activa 2FA en tu cuenta Google)'
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

  private readonly API       = 'http://localhost:8080/configuracion-correo';
  private readonly DRIVE_API = 'http://localhost:8080/drive';

  drawerAbierto  = false;
  usuarioLogueado = '';
  rol = '';

  // ── CORREO ────────────────────────────────────────────────────────────────
  configs: any[] = [];
  cargando = false;

  mostrarModal = false;
  modoModal: 'crear' | 'editar' = 'crear';
  guardando = false;
  probandoId: number | null = null;
  error = '';
  mostrarPassword = false;
  tabActivo: 'correo' | 'drive' = 'correo';

  propositos           = PROPOSITOS;
  proveedores          = Object.keys(PRESETS);
  proveedorSeleccionado = 'GMAIL';
  notaPreset           = PRESETS['GMAIL'].nota;
  configActual: any    = this.configVacia();

  // ── NOTIFICACIONES ────────────────────────────────────────────────────────
  mostrarNotificacion = false;
  notificacionTitulo  = '';
  notificacionMensaje = '';
  notificacionTipo: 'exito' | 'error' | 'confirmar' = 'exito';
  accionPendiente: (() => void) | null = null;

  // ── DRIVE ─────────────────────────────────────────────────────────────────
  driveEstado: any     = null;
  mostrarModalDrive    = false;
  guardandoDrive       = false;
  verificandoDrive     = false;
  iniciandoAuth        = false;
  errorDrive           = false;
  mensajeDrive         = '';
  mostrarDriveSecret   = false;
  driveForm = { clientId: '', clientSecret: '', folderId: '', folderNombre: '' };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.rol            = localStorage.getItem('rol')     || '';
    this.usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';
    this.cargarConfigs();
    this.cargarEstadoDrive();

    // Detectar si viene del callback de OAuth2
    this.route.queryParams.subscribe(params => {
      if (params['drive'] === 'conectado') {
        this.mostrarAlerta('✅ Drive conectado', 'Google Drive se conectó correctamente.', 'exito');
        this.cargarEstadoDrive();
      } else if (params['drive'] === 'error') {
        this.mostrarAlerta('❌ Error al conectar', 'No se pudo completar la autorización de Drive.', 'error');
      }
    });
  }

  // ── CORREO ────────────────────────────────────────────────────────────────

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
      next: data  => { this.configs = data; this.cargando = false; this.cdr.detectChanges(); },
      error: ()   => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  abrirModalCrear(): void {
    this.modoModal            = 'crear';
    this.configActual         = this.configVacia();
    this.proveedorSeleccionado = 'GMAIL';
    this.notaPreset           = PRESETS['GMAIL'].nota;
    this.error                = '';
    this.mostrarPassword      = false;
    this.mostrarModal         = true;
  }

  abrirModalEditar(c: any): void {
    this.modoModal            = 'editar';
    this.configActual         = { ...c, passwordRemitente: '' };
    this.proveedorSeleccionado = c.proveedor || 'CUSTOM';
    this.notaPreset           = PRESETS[this.proveedorSeleccionado]?.nota || '';
    this.error                = '';
    this.mostrarPassword      = false;
    this.mostrarModal         = true;
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
      error: err => {
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
      error: err => {
        this.probandoId = null;
        this.mostrarAlerta('❌ Fallo en prueba',
          err.error?.error ?? 'No se pudo conectar al servidor SMTP.', 'error');
      }
    });
  }

  cambiarEstado(c: any): void {
    const nuevoEstado = !c.activo;
    this.http.patch(`${this.API}/${c.idConfig}/estado?activo=${nuevoEstado}`, {}).subscribe({
      next:  () => { c.activo = nuevoEstado; this.cdr.detectChanges(); },
      error: () => this.mostrarAlerta('Error', 'No se pudo cambiar el estado.', 'error')
    });
  }

  confirmarEliminar(c: any): void {
    this.accionPendiente = () => {
      this.http.delete(`${this.API}/${c.idConfig}`).subscribe({
        next:  () => { this.cargarConfigs(); this.mostrarAlerta('Eliminado', `"${c.nombreDisplay}" eliminado.`, 'exito'); },
        error: () => this.mostrarAlerta('Error', 'No se pudo eliminar.', 'error')
      });
    };
    this.mostrarAlerta('¿Eliminar configuración?', `¿Eliminar "${c.nombreDisplay}"?`, 'confirmar');
  }

  getLabelProposito(v: string): string { return this.propositos.find(p => p.value === v)?.label ?? v; }
  getIconProposito(v: string):  string { return this.propositos.find(p => p.value === v)?.icon  ?? '📧'; }
  getProtocoloBadge(c: any):    string {
    if (c.sslHabilitado)      return 'SSL 465';
    if (c.starttlsHabilitado) return 'TLS 587';
    return 'SMTP';
  }

  // ── DRIVE ─────────────────────────────────────────────────────────────────

  cargarEstadoDrive(): void {
    this.http.get<any>(`${this.DRIVE_API}/estado`).subscribe({
      next: e => {
        console.log('Drive estado:', e);  // ← temporal
        this.driveEstado = e;
        this.cdr.detectChanges();
      },
      error: () => { this.driveEstado = { conectado: false }; this.cdr.detectChanges(); }
    });
  }

  abrirModalDrive(): void {
    this.driveForm = {
      clientId:     '',
      clientSecret: '',
      folderId:     this.driveEstado?.folderId     ?? '',
      folderNombre: this.driveEstado?.folderNombre ?? ''
    };
    this.mostrarModalDrive = true;
  }

  cerrarModalDrive(): void { this.mostrarModalDrive = false; }

  guardarConfigDrive(): void {
    // ── VALIDACIONES ──────────────────────────────────────────────
    const errores: string[] = [];

    const clientId     = this.driveForm.clientId.trim();
    const clientSecret = this.driveForm.clientSecret.trim();
    const folderId     = this.driveForm.folderId.trim();
    const folderNombre = this.driveForm.folderNombre.trim();

    // Client ID — si se ingresó, debe tener formato correcto
    if (clientId && !clientId.endsWith('.apps.googleusercontent.com')) {
      errores.push('El Client ID debe terminar en .apps.googleusercontent.com');
    }

    // Client Secret — si se ingresó, debe iniciar con GOCSPX-
    if (clientSecret && !clientSecret.startsWith('GOCSPX-')) {
      errores.push('El Client Secret debe iniciar con GOCSPX-');
    }

    // Folder ID — obligatorio, solo letras, números, guiones y guiones bajos
    if (!folderId) {
      errores.push('El Folder ID es obligatorio');
    } else if (!/^[a-zA-Z0-9_\-]+$/.test(folderId)) {
      errores.push('El Folder ID solo puede contener letras, números, - y _');
    }

    // Nombre de carpeta — obligatorio
    if (!folderNombre) {
      errores.push('El nombre de la carpeta es obligatorio');
    }

    if (errores.length > 0) {
      this.mostrarAlerta('Errores de validación', errores.join(' • '), 'error');
      return;
    }

    // ── GUARDAR ───────────────────────────────────────────────────
    this.guardandoDrive = true;
    this.http.put(`${this.DRIVE_API}/config`, {
      clientId:     clientId     || null,
      clientSecret: clientSecret || null,
      folderId:     folderId,
      folderNombre: folderNombre
    }).subscribe({
      next: () => {
        this.guardandoDrive = false;
        this.cerrarModalDrive();
        this.cargarEstadoDrive();
        this.mostrarAlerta('Configuración guardada', 'Credenciales de Drive actualizadas correctamente.', 'exito');
      },
      error: err => {
        this.guardandoDrive = false;
        this.mostrarAlerta('Error', err.error?.error ?? 'No se pudo guardar la configuración.', 'error');
      }
    });
  }
  iniciarAuthDrive(): void {
    // Verificar que existan credenciales en BD antes de intentar auth
    if (!this.driveEstado?.clientIdPreview) {
      this.mostrarAlerta(
        'Credenciales requeridas',
        'Configura primero el Client ID y Client Secret antes de conectar.',
        'error'
      );
      return;
    }

    this.iniciandoAuth = true;
    this.cdr.detectChanges();
    this.http.get<any>(`${this.DRIVE_API}/iniciar-auth`).subscribe({
      next: res => {
        this.iniciandoAuth = false;
        this.cdr.detectChanges();
        window.open(res.url, '_blank');
      },
      error: () => {
        this.iniciandoAuth = false;
        this.cdr.detectChanges();
        this.mostrarAlerta('Error', 'No se pudo generar la URL de autorización.', 'error');
      }
    });
  }
  verificarDrive(): void {
    this.verificandoDrive = true;
    this.mensajeDrive = '';
    this.http.get<any>(`${this.DRIVE_API}/verificar`).subscribe({
      next: res => {
        this.verificandoDrive = false;
        this.errorDrive   = !res.conectado;
        this.mensajeDrive = res.mensaje;
        this.cargarEstadoDrive(); // ← agrega esta línea
        this.cdr.detectChanges();
      },
      error: () => {
        this.verificandoDrive = false;
        this.errorDrive   = true;
        this.mensajeDrive = 'Error al verificar conexión.';
        this.cdr.detectChanges();
      }
    });
  }

  confirmarRevocarDrive(): void {
    this.accionPendiente = () => {
      this.http.post(`${this.DRIVE_API}/revocar`, {}).subscribe({
        next: () => {
          this.cargarEstadoDrive();
          this.mostrarAlerta('Autorización revocada', 'Se desconectó Google Drive correctamente.', 'exito');
        },
        error: () => this.mostrarAlerta('Error', 'No se pudo revocar la autorización.', 'error')
      });
    };
    this.mostrarAlerta('¿Revocar autorización?',
      'Se eliminarán los tokens y se desconectará Drive.', 'confirmar');
  }

  // ── HELPERS ───────────────────────────────────────────────────────────────

  mostrarAlerta(titulo: string, mensaje: string, tipo: 'exito' | 'error' | 'confirmar'): void {
    this.notificacionTitulo  = titulo;
    this.notificacionMensaje = mensaje;
    this.notificacionTipo    = tipo;
    this.mostrarNotificacion = true;
    this.cdr.detectChanges();
    if (tipo !== 'confirmar') {
      setTimeout(() => { this.mostrarNotificacion = false; this.cdr.detectChanges(); }, 4000);
    }
  }

  cerrarNotificacion(): void {
    this.mostrarNotificacion = false;
    this.accionPendiente = null;
    this.cdr.detectChanges();
  }

  confirmarAccion(): void {
    this.mostrarNotificacion = false;
    if (this.accionPendiente) { this.accionPendiente(); this.accionPendiente = null; }
    this.cdr.detectChanges();
  }

  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer():  void { this.drawerAbierto = false; }
  navegar(ruta: string): void { this.cerrarDrawer(); this.router.navigate([`/${ruta}`]); }
  volver():  void { this.router.navigate(['/dashboard']); }
  logout():  void { localStorage.clear(); this.router.navigate(['/login']); }
}
