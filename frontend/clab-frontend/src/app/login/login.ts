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

    const user = this.username.trim();
    const pass = this.password.trim();

    if (user === 'admin' && pass === '1234') {
      this.auth.login();
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Usuario o contraseña incorrectos.';
    }
  }
}

export class Login {
}
