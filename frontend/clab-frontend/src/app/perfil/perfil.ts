
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PerfilService, PerfilUsuario, ReservaHistorial } from '../services/perfil.service';
import { AuthService } from '../auth/auth.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.scss']
})
export class PerfilComponent implements OnInit {

  perfil: PerfilUsuario | null = null;
  cargando = true;
  editando = false;
  guardando = false;

  editForm = { nombres: '', apellidos: '', email: '', telefono: '' };

  modalPwd = false;
  guardandoPwd = false;
  pwdForm = { contraseniaActual: '', contraseniaNueva: '', confirmar: '' };
  pwdStrength = 0;
  pwdError = '';
  pwdExito = false;

  tabActiva: 'datos' | 'historial' = 'datos';
  reservas: ReservaHistorial[] = [];
  reservasFiltradas: ReservaHistorial[] = [];
  filtroEstado = 'todas';
  cargandoReservas = false;

  get totalReservas()  { return this.reservas.length; }
  get completadas()    { return this.reservas.filter(r => r.estado === 'COMPLETADA').length; }
  get canceladas()     { return this.reservas.filter(r => r.estado === 'CANCELADA').length; }
  get pctAsistencia() {
    const c = this.reservas.filter(r => r.asistio !== null);
    return c.length ? Math.round(c.filter(r => r.asistio).length / c.length * 100) : 0;
  }

  constructor(
    private perfilService: PerfilService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {
    const id = this.authService.getIdUsuario();
    console.log('ID usuario:', id);
    console.log('localStorage idUsuario:', localStorage.getItem('idUsuario'));

    if (!id) { this.router.navigate(['/login']); return; }
    this.cargarPerfil(id);
  }
  cargarPerfil(id: number): void {
    this.cargando = true;
    this.perfilService.obtenerPerfil(id).subscribe({
      next: p => {
        this.perfil = p;
        this.resetEditForm();
        this.cargando = false;
        this.cdr.detectChanges();  // ← agregar esta línea
      },
      error: (err) => {
        console.error('Error:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
  iniciarEdicion(): void   { this.resetEditForm(); this.editando = true; }
  cancelarEdicion(): void  { this.editando = false; this.resetEditForm(); }

  guardarEdicion(): void {
    if (!this.perfil) return;
    this.guardando = true;
    this.perfilService.actualizarPerfil(this.perfil.idUsuario, {
      ...this.editForm,
      identidad: this.perfil.identidad,
      usuario:   this.perfil.usuario,
      idsRoles:  (this.perfil as any).idsRoles
    } as any).subscribe({
      next: actualizado => {
        this.perfil = actualizado;
        this.editando = false;
        this.guardando = false;
        // Actualizar nombre en localStorage
        localStorage.setItem('usuario',
          `${actualizado.nombres.split(' ')[0]} ${actualizado.apellidos.split(' ')[0]}`
        );
        this.cdr.detectChanges();
      },
      error: () => this.guardando = false
    });
  }

  resetEditForm(): void {
    if (!this.perfil) return;
    this.editForm = {
      nombres:   this.perfil.nombres,
      apellidos: this.perfil.apellidos,
      email:     this.perfil.email,
      telefono:  this.perfil.telefono
    };
  }

  get iniciales(): string {
    if (!this.perfil) return '?';
    return (this.perfil.nombres[0] + (this.perfil.apellidos[0] || '')).toUpperCase();
  }

  abrirModalPwd(): void {
    this.pwdForm = { contraseniaActual: '', contraseniaNueva: '', confirmar: '' };
    this.pwdStrength = 0; this.pwdError = ''; this.pwdExito = false;
    this.modalPwd = true;
  }
  cerrarModalPwd(): void { this.modalPwd = false; }

  calcularStrength(): void {
    const v = this.pwdForm.contraseniaNueva;
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    this.pwdStrength = s;
  }

  get strengthLabel(): string { return ['', 'Muy débil', 'Débil', 'Aceptable', 'Fuerte'][this.pwdStrength]; }
  get strengthColor(): string { return ['', '#ff4455', '#ff8800', '#ffcc00', '#00ff88'][this.pwdStrength]; }
  get strengthWidth(): string { return ['0%', '25%', '50%', '75%', '100%'][this.pwdStrength]; }

  guardarContrasenia(): void {
    this.pwdError = '';
    if (!this.pwdForm.contraseniaActual || !this.pwdForm.contraseniaNueva || !this.pwdForm.confirmar) {
      this.pwdError = 'Completa todos los campos'; return;
    }
    if (this.pwdForm.contraseniaNueva !== this.pwdForm.confirmar) {
      this.pwdError = 'Las contraseñas no coinciden'; return;
    }
    if (this.pwdStrength < 2) {
      this.pwdError = 'La contraseña es demasiado débil'; return;
    }
    this.guardandoPwd = true;
    this.perfilService.cambiarContrasenia({
      contraseniaActual: this.pwdForm.contraseniaActual,
      contraseniaNueva:  this.pwdForm.contraseniaNueva
    }).subscribe({
      next: () => {
        this.guardandoPwd = false;
        this.pwdExito = true;
        setTimeout(() => {
          this.cerrarModalPwd();
          const id = this.authService.getIdUsuario();
          if (id) this.cargarPerfil(id);
        }, 1500);
      },
    });
  }

  cambiarTab(tab: 'datos' | 'historial'): void {
    this.tabActiva = tab;
    if (tab === 'historial' && !this.reservas.length) this.cargarHistorial();
  }

  cargarHistorial(): void {
    if (!this.perfil) return;
    this.cargandoReservas = true;
    this.perfilService.obtenerHistorialReservas(this.perfil.idUsuario).subscribe({
      next: r => { this.reservas = r; this.aplicarFiltro('todas'); this.cargandoReservas = false; },
      error: () => this.cargandoReservas = false
    });
  }

  aplicarFiltro(estado: string): void {
    this.filtroEstado = estado;
    this.reservasFiltradas = estado === 'todas'
      ? this.reservas
      : this.reservas.filter(r => r.estado === estado.toUpperCase());
  }

  badgeClass(estado: string): string {
    return ({ CONFIRMADA: 'confirmada', COMPLETADA: 'completada', CANCELADA: 'cancelada', PENDIENTE: 'pendiente' } as any)[estado] ?? '';
  }

  volver(): void { this.router.navigate(['/dashboard']); }
}
