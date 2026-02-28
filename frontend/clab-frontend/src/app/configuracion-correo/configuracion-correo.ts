import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
  guardando = false;
  mensaje = '';
  error = '';
  mostrarPassword = false;

  config = {
    idConfig: null as number | null,
    host: 'smtp.gmail.com',
    puerto: 587,
    emailRemitente: '',
    passwordRemitente: '',
    nombreRemitente: '',
    authHabilitado: true,
    starttlsHabilitado: true,
    activo: true
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.rol = localStorage.getItem('rol') || '';
    this.usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';
    this.cargarConfig();
  }

  cargarConfig(): void {
    this.http.get<any>('http://localhost:8080/configuracion/correo').subscribe({
      next: (data) => { this.config = data; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  guardar(): void {
    if (!this.config.emailRemitente || !this.config.host || !this.config.passwordRemitente) {
      this.error = 'Host, email y contraseña son obligatorios.';
      return;
    }
    this.guardando = true;
    this.mensaje = '';
    this.error = '';

    const request$ = this.config.idConfig
      ? this.http.put<any>(`http://localhost:8080/configuracion/correo/${this.config.idConfig}`, this.config)
      : this.http.post<any>('http://localhost:8080/configuracion/correo', this.config);

    request$.subscribe({
      next: (data) => {
        this.guardando = false;
        this.config = data;
        this.mensaje = '¡Configuración guardada correctamente!';
        this.cdr.detectChanges();
        setTimeout(() => { this.mensaje = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.guardando = false;
        this.error = err.error?.error ?? 'Error al guardar la configuración.';
        this.cdr.detectChanges();
      }
    });
  }

  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }

  navegar(ruta: string, mensaje: string = ''): void {
    this.cerrarDrawer();
    this.router.navigate([`/${ruta}`]);
  }

  volver(): void { this.router.navigate(['/dashboard']); }
  logout(): void { localStorage.clear(); this.router.navigate(['/login']); }
}
