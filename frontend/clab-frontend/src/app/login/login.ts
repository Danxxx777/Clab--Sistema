import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  recordarme = false; // ← AGREGAR ESTA LÍNEA
  errorMessage = '';

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  login() {
    this.errorMessage = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Debe completar usuario y contraseña.';
      return;
    }

    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage = 'Usuario o contraseña incorrectos.';
      }
    });
  }
}
