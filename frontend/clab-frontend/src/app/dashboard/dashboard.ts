import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TestService } from '../services/test.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit {

  mensajeBackend = '';
  cargando = false;
  loadingText = '';
  drawerAbierto = false;
  usuarioLogueado = '';
  rolActual = '';
  rol: string | null = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private testService: TestService,
    private cdr: ChangeDetectorRef
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
      next: (res) => {
        this.mensajeBackend = res;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajeBackend = 'No se pudo conectar con el backend';
        this.cdr.detectChanges();
      }
    });
  }

  toggleDrawer(): void {
    this.drawerAbierto = !this.drawerAbierto;
  }

  cerrarDrawer(): void {
    this.drawerAbierto = false;
  }

  navegar(ruta: string, mensaje: string): void {
    if (this.cargando) return;
    this.cerrarDrawer();
    this.loadingText = mensaje;
    this.cargando = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.router.navigate([ruta]);
    }, 1500);
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  protected auditoria(auditoria: string) {}
  protected reportesuso(reportesuso: string) {}
  protected notificaciones(notificaciones: string) {}
  protected bloqueos(bloqueos: string) {}

  protected fallas(fallas: string) {
    this.router.navigate(['reporte-fallas']);
  }

  protected asistencia(asistencia: string) {}

  protected estudiantes(estudiantes: string) {
    this.router.navigate(['estudiantes']);
  }

  protected academico(academico: string) {
    this.router.navigate(['academico']);
  }

  protected reservas(reservas: string) {
    this.router.navigate(['reservar']);
  }

  protected equipos(_: string) {
    this.router.navigate(['equipos']);
  }

  protected laboratorios(_: string) {
    this.router.navigate(['laboratorios']);
  }

  protected usuario(usuarios: string) {
    this.router.navigate(['usuarios']);
  }
}
