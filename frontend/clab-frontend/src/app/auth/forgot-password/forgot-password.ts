import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPasswordComponent {

  email = '';
  mensaje = '';
  error = '';
  cargando = false;

  constructor(private http: HttpClient, private router: Router) {}

  enviar() {
    if (!this.email.trim()) {
      this.error = 'Ingresa tu correo electrónico.';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.mensaje = '';

    this.http.post('http://localhost:8080/auth/forgot-password', { email: this.email }).subscribe({
      next: () => {
        this.cargando = false;
        // Guardar email en localStorage para usarlo en los siguientes pasos
        localStorage.setItem('recuperacion_email', this.email);
        this.router.navigate(['/verificar-codigo']);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.error ?? 'Error al enviar el código.';
      }
    });
  }
}
