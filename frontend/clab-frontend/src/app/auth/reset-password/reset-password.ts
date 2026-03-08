import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPasswordComponent implements OnInit {

  email = '';
  codigo = '';
  nuevaPassword = '';
  confirmarPassword = '';
  mensaje = '';
  error = '';
  cargando = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.email = sessionStorage.getItem('recuperacion_email') ?? '';
    this.codigo = sessionStorage.getItem('recuperacion_codigo') ?? '';
    if (!this.email || !this.codigo) {
      this.router.navigate(['/forgot-password']);
    }
  }

  cambiar() {
    if (!this.nuevaPassword.trim()) {
      this.error = 'Ingresa tu nueva contraseña.';
      return;
    }
    if (this.nuevaPassword !== this.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }
    if (this.nuevaPassword.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.http.post('http://localhost:8080/auth/reset-password', {
      email: this.email,
      codigo: this.codigo,
      nuevaPassword: this.nuevaPassword
    }).subscribe({
      next: () => {
        this.cargando = false;
        this.mensaje = '¡Contraseña actualizada correctamente!';
        sessionStorage.removeItem('recuperacion_email');
        sessionStorage.removeItem('recuperacion_codigo');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.error ?? 'No se pudo actualizar la contraseña.';
      }
    });
  }
}
