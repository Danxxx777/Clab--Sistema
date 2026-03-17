import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cambiar-contrasenia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cambiar-contrasenia.html',
  styleUrls: ['./cambiar-contrasenia.scss']
})
export class CambiarContraseniaComponent {

  nuevaContrasenia = '';
  confirmarContrasenia = '';
  mostrarNueva = false;
  mostrarConfirmar = false;
  enviando = false;
  errorMsg = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  guardar() {
    this.errorMsg = '';

    if (!this.nuevaContrasenia || !this.confirmarContrasenia) {
      this.errorMsg = 'Por favor completa ambos campos.';
      return;
    }

    if (this.nuevaContrasenia.length < 8) {
      this.errorMsg = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    if (this.nuevaContrasenia !== this.confirmarContrasenia) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }

    this.enviando = true;
    const idUsuario = sessionStorage.getItem('idUsuario');

    this.http.post<any>('http://localhost:8080/usuarios/cambiar-contrasenia-primer-login', {
      idUsuario: Number(idUsuario),
      nuevaContrasenia: this.nuevaContrasenia
    }).subscribe({
      next: (res) => {
        this.enviando = false;
        sessionStorage.setItem('primerLogin', 'false');
        this.router.navigate(['/dashboard']);
        this.cdr.detectChanges();
      },
      error: () => {
        this.enviando = false;
        this.errorMsg = 'Error al cambiar la contraseña. Intenta de nuevo.';
        this.cdr.detectChanges();
      }
    });
  }
}
