import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const PROPOSITOS = [
  { value: 'GENERAL',         label: 'General',                   icon: '📧' },
  { value: 'RECUPERACION',    label: 'Recuperación de contraseña', icon: '🔑' },
  { value: 'NOTIFICACIONES',  label: 'Notificaciones del sistema', icon: '🔔' },
  { value: 'RESERVAS',        label: 'Alertas de reservas',        icon: '📅' },
  { value: 'REPORTES',        label: 'Reportes automáticos',       icon: '📊' },
];

@Component({
  selector: 'app-configuracion-correo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion-correo.html',
  styleUrls: ['./configuracion-correo.scss']
})
export class ConfiguracionCorreoComponent implements OnInit {

  drawerAbierto = false;
  usuarioLogueado = '';
  rol = '';

  configs: any[] = [];
  cargando = false;

  mostrarModal = false;
  modoModal: 'crear' | 'editar' = 'crear';
  guardando = false;
  mensaje = '';
  error = '';
  mostrarPassword = false;

  propositos = PROPOSITOS;
  configActual: any = this.configVacia();

  mostrarNotificacion = false;
  notificacionTitulo = '';
  notificacionMensaje = '';
  notificacionTipo: 'exito' | 'error' | 'confirmar' = 'exito';
  accionPendiente: (() => void) | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.rol = localStorage.getItem('rol') || '';
    this.usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';
    this.cargarConfigs();
  }

  configVacia(): any {
    return {
      idConfig: null,
      nombreDisplay: '',
      proposito: 'GENERAL',
      host: 'smtp.gmail.com',
      puerto: 587,
      emailRemitente: '',
      passwordRemitente: '',
      nombreRemitente: 'CLAB Sistema',
      authHabilitado: true,
      starttlsHabilitado: true,
      activo: true
    };
  }

  cargarConfigs(): void {
    this.cargando = true;
    this.http.get<any[]>('http://localhost:8080/configuracion/correo/listar').subscribe({
      next: (data) => {
        this.configs = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  abrirModalCrear(): void {
    this.modoModal = 'crear';
    this.configActual = this.configVacia();
    this.mensaje = '';
    this.error = '';
    this.mostrarPassword = false;
    this.mostrarModal = true;
  }

  abrirModalEditar(c: any): void {
    this.modoModal = 'editar';
    this.configActual = { ...c };
    this.mensaje = '';
    this.error = '';
    this.mostrarPassword = false;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.cdr.detectChanges();
  }

  guardar(): void {
    if (!this.configActual.emailRemitente || !this.configActual.host ||
      !this.configActual.passwordRemitente || !this.configActual.nombreDisplay) {
      this.error = 'Nombre, host, email y contraseña son obligatorios.';
      this.cdr.detectChanges();
      return;
    }

    this.guardando = true;
    this.mensaje = '';
    this.error = '';

    const request$ = this.modoModal === 'editar'
      ? this.http.put<any>(`http://localhost:8080/configuracion/correo/${this.configActual.idConfig}`, this.configActual)
      : this.http.post<any>('http://localhost:8080/configuracion/correo', this.configActual);

    request$.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        this.cargarConfigs();
        this.mostrarAlerta(
          this.modoModal === 'crear' ? '¡Correo agregado!' : '¡Correo actualizado!',
          `La configuración "${this.configActual.nombreDisplay}" fue guardada correctamente.`,
          'exito'
        );
      },
      error: (err) => {
        this.guardando = false;
        this.error = err.error?.error ?? 'Error al guardar.';
        this.cdr.detectChanges();
      }
    });
  }

  cambiarEstado(c: any): void {
    const nuevoEstado = !c.activo;
    this.http.patch(`http://localhost:8080/configuracion/correo/${c.idConfig}/estado`, { activo: nuevoEstado }).subscribe({
      next: () => {
        c.activo = nuevoEstado;
        this.cdr.detectChanges();
      },
      error: () => this.mostrarAlerta('Error', 'No se pudo cambiar el estado.', 'error')
    });
  }

  confirmarEliminar(c: any): void {
    this.accionPendiente = () => {
      this.http.delete(`http://localhost:8080/configuracion/correo/${c.idConfig}`).subscribe({
        next: () => {
          this.cargarConfigs();
          this.mostrarAlerta('Eliminado', `"${c.nombreDisplay}" fue eliminado.`, 'exito');
        },
        error: () => this.mostrarAlerta('Error', 'No se pudo eliminar.', 'error')
      });
    };
    this.mostrarAlerta('¿Eliminar configuración?', `¿Eliminar "${c.nombreDisplay}"? Esta acción no se puede deshacer.`, 'confirmar');
  }

  getLabelProposito(value: string): string {
    return this.propositos.find(p => p.value === value)?.label ?? value;
  }

  getIconProposito(value: string): string {
    return this.propositos.find(p => p.value === value)?.icon ?? '📧';
  }

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

  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }
  navegar(ruta: string): void { this.cerrarDrawer(); this.router.navigate([`/${ruta}`]); }
  volver(): void { this.router.navigate(['/dashboard']); }
  logout(): void { localStorage.clear(); this.router.navigate(['/login']); }
}
