import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-verificar-codigo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './verificar-codigo.html',
  styleUrl: './verificar-codigo.scss',
})
export class VerificarCodigoComponent implements OnInit {

  email = '';
  codigo = '';
  error = '';
  cargando = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.email = localStorage.getItem('recuperacion_email') ?? '';
    if (!this.email) {
      this.router.navigate(['/forgot-password']);
    }
  }

  verificar() {
    if (!this.codigo.trim()) {
      this.error = 'Ingresa el código.';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.http.post('http://localhost:8080/auth/verificar-codigo', {
      email: this.email,
      codigo: this.codigo
    }).subscribe({
      next: () => {
        this.cargando = false;
        localStorage.setItem('recuperacion_codigo', this.codigo);
        this.router.navigate(['/reset-password']);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.error ?? 'Código incorrecto o expirado.';
      }
    });
  }

  reenviar() {
    this.http.post('http://localhost:8080/auth/forgot-password', { email: this.email }).subscribe({
      next: () => {
        this.error = '';
        this.codigo = '';
        alert('Código reenviado a tu correo.');
      },
      error: () => {
        this.error = 'No se pudo reenviar el código.';
      }
    });
  }
}
