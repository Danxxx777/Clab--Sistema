import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { TestService } from '../services/test.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  imports: [CommonModule, FormsModule]
})
export class DashboardComponent implements OnInit {

  mensajeBackend = '';
  cargando = false;
  loadingText = '';
  drawerAbierto = false;
  usuarioLogueado = '';
  rolActual = '';
  rol: string | null = '';

  // CONFIGURACIÓN CORREO
  mostrarConfigCorreo = false;
  guardandoConfig = false;
  configCorreo = {
    idConfig: null as number | null,
    host: '',
    puerto: 587,
    emailRemitente: '',
    passwordRemitente: '',
    nombreRemitente: '',
    authHabilitado: true,
    starttlsHabilitado: true,
    activo: true
  };
  configMensaje = '';
  configError = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private testService: TestService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    this.rol = localStorage.getItem('rol');
    this.usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';
    this.rolActual = localStorage.getItem('rol') || '';

    this.testService.getTest().subscribe({
      next: (res) => { this.mensajeBackend = res; this.cdr.detectChanges(); },
      error: () => { this.mensajeBackend = 'No se pudo conectar con el backend'; this.cdr.detectChanges(); }
    });

    if (this.rol === 'Administradorr') {
      this.cargarConfigCorreo();
    }
  }

  cargarConfigCorreo(): void {
    this.http.get<any>('http://localhost:8080/configuracion/correo').subscribe({
      next: (data) => {
        this.configCorreo = data;
        this.cdr.detectChanges();
      },
      error: () => {} // si no hay config aún, el form queda vacío
    });
  }

  guardarConfigCorreo(): void {
    this.guardandoConfig = true;
    this.configMensaje = '';
    this.configError = '';

    const request$ = this.configCorreo.idConfig
      ? this.http.put(`http://localhost:8080/configuracion/correo/${this.configCorreo.idConfig}`, this.configCorreo)
      : this.http.post('http://localhost:8080/configuracion/correo', this.configCorreo);

    request$.subscribe({
      next: (data: any) => {
        this.guardandoConfig = false;
        this.configCorreo = data;
        this.configMensaje = '¡Configuración guardada correctamente!';
        this.cdr.detectChanges();
        setTimeout(() => { this.configMensaje = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.guardandoConfig = false;
        this.configError = err.error?.error ?? 'Error al guardar la configuración.';
        this.cdr.detectChanges();
      }
    });
  }

  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }

  navegar(ruta: string, mensaje: string): void {
    if (this.cargando) return;
    this.cerrarDrawer();
    this.loadingText = mensaje;
    this.cargando = true;
    this.cdr.detectChanges();
    setTimeout(() => { this.router.navigate([ruta]); }, 450);
  }

  goTo(path: string): void { this.router.navigate([path]); }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  protected auditoria(auditoria: string) {}
  protected reportesuso(reportesuso: string) {}
  protected notificaciones(notificaciones: string) {}
  protected bloqueos(bloqueos: string) {}
  protected fallas(fallas: string) { this.router.navigate(['reporte-fallas']); }
  protected asistencia(asistencia: string) {}
  protected estudiantes(estudiantes: string) { this.router.navigate(['estudiantes']); }
  protected academico(academico: string) { this.router.navigate(['academico']); }
  protected reservas(reservas: string) { this.router.navigate(['reservar']); }
  protected equipos(_: string) { this.router.navigate(['equipos']); }
  protected laboratorios(_: string) { this.router.navigate(['laboratorios']); }
  protected usuario(usuarios: string) { this.router.navigate(['usuarios']); }
}
