import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // ← agregar RouterModule
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})

export class ForgotPasswordComponent {

  email: string = '';
  mensaje: string = '';

  constructor(private http: HttpClient) {}

  enviar() {
    this.http.post(
      `http://localhost:8080/auth/forgot-password?email=${this.email}`,
      {}
    ).subscribe({
      next: () => {
        this.mensaje = "Revisa tu correo (token generado).";
      },
      error: () => {
        this.mensaje = "Error al enviar recuperación.";
      }
    });
  }
}
//
