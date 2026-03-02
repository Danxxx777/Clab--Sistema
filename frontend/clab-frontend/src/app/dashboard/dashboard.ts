import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { TestService } from '../services/test.service';
import { ViewChild, ElementRef } from '@angular/core';

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

  // ROLES MÚLTIPLES
  rolesDisponibles: string[] = [];
  mostrarSelectorRol = false;
  cambiandoRol = false;

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

    // Cargar roles disponibles desde localStorage
    const rolesGuardados = localStorage.getItem('rolesDisponibles');
    if (rolesGuardados) {
      this.rolesDisponibles = JSON.parse(rolesGuardados);
    }

    this.testService.getTest().subscribe({
      next: (res) => { this.mensajeBackend = res; this.cdr.detectChanges(); },
      error: () => { this.mensajeBackend = 'No se pudo conectar con el backend'; this.cdr.detectChanges(); }
    });
  }

  toggleSelectorRol(): void {
    if (this.rolesDisponibles.length > 1) {
      this.mostrarSelectorRol = !this.mostrarSelectorRol;
    }
  }

  cerrarSelectorRol(): void {
    this.mostrarSelectorRol = false;
  }

  cambiarRol(nombreRol: string): void {
    if (nombreRol === this.rolActual) {
      this.mostrarSelectorRol = false;
      return;
    }

    this.cambiandoRol = true;
    this.mostrarSelectorRol = false;
    const idUsuario = parseInt(localStorage.getItem('idUsuario') || '0');

    this.http.post<any>('http://localhost:8080/auth/cambiar-rol', {
      idUsuario,
      nombreRol
    }).subscribe({
      next: (res) => {
        // Actualizar localStorage con el nuevo token y rol
        localStorage.setItem('token', res.token);
        localStorage.setItem('rol', res.rol);
        localStorage.setItem('rolesDisponibles', JSON.stringify(res.rolesDisponibles));

        this.rol = res.rol;
        this.rolActual = res.rol;
        this.rolesDisponibles = res.rolesDisponibles;
        this.cambiandoRol = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cambiandoRol = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }

  navegar(ruta: string, mensaje: string): void {
    if (this.cargando) return;
    this.cerrarDrawer();
    this.cerrarSelectorRol();
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
  @ViewChild('rolWrapper') rolWrapper!: ElementRef;

// nuevo método:
  onDocumentClick(event: MouseEvent): void {
    if (this.rolWrapper && !this.rolWrapper.nativeElement.contains(event.target)) {
      this.cerrarSelectorRol();
    }
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
