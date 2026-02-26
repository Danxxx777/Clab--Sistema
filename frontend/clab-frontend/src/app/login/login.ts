import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {

  username = '';
  password = '';
  recordarme = false;
  errorMessage = '';
  mostrarPassword = false;
  cargando = false;
  loadingText = 'Verificando credenciales...';

  private loadingMessages = [
    'Verificando credenciales...',
    'Cargando tu perfil...',
    'Preparando el sistema...',
    'Casi listo...'
  ];

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  login(): void {
    this.errorMessage = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Debe completar usuario y contraseña.';
      return;
    }

    this.cargando = true;
    this.loadingText = this.loadingMessages[0];


    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      msgIndex++;
      if (msgIndex < this.loadingMessages.length) {
        this.loadingText = this.loadingMessages[msgIndex];
      }
    }, 1000);

    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        clearInterval(msgInterval);
        this.loadingText = '¡Bienvenido!';

        // 1500ms para que se vea el "¡Bienvenido!" antes de navegar
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: () => {
        clearInterval(msgInterval);
        this.cargando = false;
        this.errorMessage = 'Usuario o contraseña incorrectos.';
      }
    });
  }
}
