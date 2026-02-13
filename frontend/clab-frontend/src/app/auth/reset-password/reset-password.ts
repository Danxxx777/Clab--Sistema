import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPasswordComponent {

  token: string = '';
  nuevaPassword: string = '';
  mensaje: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  cambiar() {
    this.http.post(
      `http://localhost:8080/auth/reset-password?token=${this.token}&nuevaPassword=${this.nuevaPassword}`,
      {}
    ).subscribe({
      next: () => {
        this.mensaje = "Contraseña actualizada correctamente";

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: () => {
        this.mensaje = "Token inválido o expirado";
      }
    });
  }

  volverLogin() {
    this.router.navigate(['/login']);
  }
}
//
