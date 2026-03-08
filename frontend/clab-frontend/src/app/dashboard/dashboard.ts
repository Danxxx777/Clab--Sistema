import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  // ── Estado general ───────────────────────────────────────────────
  mensajeBackend = '';
  cargando = false;
  loadingText = '';
  drawerAbierto = false;
  usuarioLogueado = '';
  rolActual = '';
  rol: string | null = '';

  // ── Roles múltiples ──────────────────────────────────────────────
  rolesDisponibles: string[] = [];
  mostrarSelectorRol = false;
  cambiandoRol = false;

  // ── User menu ────────────────────────────────────────────────────
  userMenuAbierto = false;

  // ── Notificaciones ───────────────────────────────────────────────
  noLeidas = 0;
  notifPanelAbierto = false;
  notificaciones: any[] = [];
  cargandoNotifs = false;

  private apiUrl = 'http://localhost:8080';

  @ViewChild('rolWrapper')   rolWrapper!:   ElementRef;
  @ViewChild('userWrapper')  userWrapper!:  ElementRef;
  @ViewChild('notifWrapper') notifWrapper!: ElementRef;

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

    this.rol             = sessionStorage.getItem('rol');
    this.usuarioLogueado = sessionStorage.getItem('usuario') || 'Usuario';
    this.rolActual       = sessionStorage.getItem('rol') || '';

    const rolesGuardados = sessionStorage.getItem('rolesDisponibles');
    if (rolesGuardados) this.rolesDisponibles = JSON.parse(rolesGuardados);

    this.cargarNoLeidas(); // ← solo el conteo del badge

    // ← QUITA cargarNotificaciones() de aquí

    this.testService.getTest().subscribe({
      next:  res => { this.mensajeBackend = res; this.cdr.detectChanges(); },
      error: ()  => { this.mensajeBackend = 'No se pudo conectar con el backend'; }
    });
  }

  // ── Helpers HTTP ─────────────────────────────────────────────────

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ── Notificaciones ───────────────────────────────────────────────

  cargarNoLeidas(): void {
    this.http.get<{ noLeidas: number }>(
      `${this.apiUrl}/notificaciones/no-leidas/count`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: res => {
        console.log('noLeidas response:', res); // ← temporal
        this.noLeidas = res.noLeidas;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('noLeidas error:', err); // ← temporal
        this.noLeidas = 0;
      }
    });
  }

  toggleNotifPanel(): void {
    this.notifPanelAbierto = !this.notifPanelAbierto;
    this.userMenuAbierto = false;
    if (this.notifPanelAbierto) {
      this.notificaciones = []; // limpiar antes de cargar
      this.cargarNotificaciones();
    }
  }

  cargarNotificaciones(): void {
    this.cargandoNotifs = true;
    this.http.get<any[]>(
      `${this.apiUrl}/notificaciones/mis-notificaciones`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: n => {
        this.notificaciones = n.filter(x => x.estado !== 'LEIDA').slice(0, 8);
        this.cargandoNotifs = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargandoNotifs = false; }
    });
  }
  getTimeAgo(fecha: string | Date): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60)      return 'ahora';
    if (diff < 3600)    return `${Math.floor(diff / 60)} min`;
    if (diff < 86400)   return `${Math.floor(diff / 3600)} h`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} d`;
    return `${Math.floor(diff / 2592000)} mes`;
  }
  marcarLeida(notif: any): void {
    if (notif.estado !== 'LEIDA') {
      this.http.put(
        `${this.apiUrl}/notificaciones/leer/${notif.idNotificacion}`, {},
        { headers: this.getHeaders() }
      ).subscribe({
        next: () => {
          this.notificaciones = this.notificaciones.filter(
            n => n.idNotificacion !== notif.idNotificacion
          );
          this.noLeidas = Math.max(0, this.noLeidas - 1);
          this.cdr.detectChanges();
        }
      });
    }
    this.notifPanelAbierto = false;
    this.navegar('notificaciones', 'Cargando Notificaciones...');
  }

  marcarTodasLeidas(): void {
    this.http.put(
      `${this.apiUrl}/notificaciones/leer-todas`, {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.notificaciones = []; // vaciar el panel
        this.noLeidas = 0;
        this.cdr.detectChanges();
      }
    });
  }
  // ── Roles ────────────────────────────────────────────────────────

  toggleSelectorRol(): void {
    if (this.rolesDisponibles.length > 1) this.mostrarSelectorRol = !this.mostrarSelectorRol;
  }

  cerrarSelectorRol(): void { this.mostrarSelectorRol = false; }

  cambiarRol(nombreRol: string): void {
    if (nombreRol === this.rolActual) { this.mostrarSelectorRol = false; return; }

    this.cambiandoRol = true;
    this.mostrarSelectorRol = false;
    const idUsuario = parseInt(sessionStorage.getItem('idUsuario') || '0');

    this.http.post<any>(`${this.apiUrl}/auth/cambiar-rol`, { idUsuario, nombreRol }).subscribe({
      next: res => {
        sessionStorage.setItem('token',            res.token);
        sessionStorage.setItem('rol',              res.rol);
        sessionStorage.setItem('rolesDisponibles', JSON.stringify(res.rolesDisponibles));

        this.rol             = res.rol;
        this.rolActual       = res.rol;
        this.rolesDisponibles = res.rolesDisponibles;
        this.cambiandoRol    = false;

        this.cargarNoLeidas();
        this.cdr.detectChanges();
      },
      error: () => { this.cambiandoRol = false; this.cdr.detectChanges(); }
    });
  }

  // ── Navegación ───────────────────────────────────────────────────

  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }

  navegar(ruta: string, mensaje: string): void {
    if (this.cargando) return;
    this.cerrarDrawer();
    this.cerrarSelectorRol();
    this.notifPanelAbierto = false;
    this.userMenuAbierto   = false;
    this.loadingText = mensaje;
    this.cargando    = true;
    this.cdr.detectChanges();
    setTimeout(() => { this.router.navigate([ruta]); }, 450);
  }

  goTo(path: string): void { this.router.navigate([path]); }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  irAPerfil(): void {
    this.userMenuAbierto = false;
    this.navegar('perfil', 'Cargando Perfil...');
  }

  // ── Click fuera ──────────────────────────────────────────────────

  onDocumentClick(event: Event): void {
    if (this.rolWrapper && !this.rolWrapper.nativeElement.contains(event.target)) {
      this.cerrarSelectorRol();
    }
  }

  onUserMenuClick(event: Event): void {
    if (this.userWrapper && !this.userWrapper.nativeElement.contains(event.target)) {
      this.userMenuAbierto = false;
    }
    if (this.notifWrapper && !this.notifWrapper.nativeElement.contains(event.target)) {
      this.notifPanelAbierto = false;
    }
  }

  toggleUserMenu(): void {
    this.userMenuAbierto   = !this.userMenuAbierto;
    this.notifPanelAbierto = false;
  }
  stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  }
  // ── Métodos legacy ───────────────────────────────────────────────
  protected auditoria(_: string)    {}
  protected reportesuso(_: string)  {}
  protected bloqueos(_: string)     {}
  protected fallas(_: string)       { this.router.navigate(['reporte-fallas']); }
  protected asistencia(_: string)   {}
  protected estudiantes(_: string)  { this.router.navigate(['estudiantes']); }
  protected academico(_: string)    { this.router.navigate(['academico']); }
  protected reservas(_: string)     { this.router.navigate(['reservar']); }
  protected equipos(_: string)      { this.router.navigate(['equipos']); }
  protected laboratorios(_: string) { this.router.navigate(['laboratorios']); }
  protected usuario(_: string)      { this.router.navigate(['usuarios']); }
}
