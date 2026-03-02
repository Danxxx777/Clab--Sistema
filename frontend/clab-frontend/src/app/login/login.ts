import { Component, ChangeDetectorRef } from '@angular/core';
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
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  login(): void {
    this.errorMessage = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Debe completar usuario y contraseña.';
      this.triggerShake();
      return;
    }

    this.cargando = true;
    this.loadingText = this.loadingMessages[0];
    this.cdr.detectChanges();

    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      msgIndex++;
      if (msgIndex < this.loadingMessages.length) {
        this.loadingText = this.loadingMessages[msgIndex];
        this.cdr.detectChanges();
      }
    }, 1000);

    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        clearInterval(msgInterval);
        this.loadingText = '¡Bienvenido!';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (err) => {
        clearInterval(msgInterval);
        this.loadingText = 'Verificando credenciales...';
        this.cdr.detectChanges();

        setTimeout(() => {
          this.cargando = false;

          const status = err.status;
          if (status === 401 || status === 403) {
            this.errorMessage = 'Contraseña incorrecta. Verifica e intenta de nuevo.';
          } else if (status === 404) {
            this.errorMessage = 'Usuario no encontrado en el sistema.';
          } else if (status === 0) {
            this.errorMessage = 'No se pudo conectar al servidor.';
          } else {
            this.errorMessage = 'Usuario o contraseña incorrectos.';
          }

          this.cdr.detectChanges();
          this.triggerShake();
        }, 1200);
      }
    });
  }

  private triggerShake(): void {
    const el = document.querySelector('.login-form-container');
    el?.classList.remove('shake');
    // forzar reflow para reiniciar animación
    void (el as HTMLElement)?.offsetWidth;
    el?.classList.add('shake');
    setTimeout(() => el?.classList.remove('shake'), 600);
  }
}
