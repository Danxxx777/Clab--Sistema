import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-solicitar-acceso',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitar-acceso.html',
  styleUrls: ['./solicitar-acceso.scss']
})
export class SolicitarAccesoComponent {

  form = {
    identidad: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    motivo: ''
  };

  enviando  = false;
  exito     = false;
  errorMsg  = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  enviar() {
    this.errorMsg = '';

    if (!this.form.identidad || !this.form.nombres || !this.form.apellidos ||
      !this.form.email || !this.form.motivo) {
      this.errorMsg = 'Por favor completa todos los campos obligatorios.';
      this.cdr.detectChanges();
      return;
    }

    this.enviando = true;
    this.cdr.detectChanges();

    this.http.post<any>('http://localhost:8080/api/solicitudes/crear', this.form)
      .subscribe({
        next: (res) => {
          this.enviando = false;
          if (Number(res.codigo) === 1) {
            this.exito = true;
          } else {
            this.errorMsg = res.mensaje;
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.enviando = false;
          this.errorMsg = 'Error al conectar con el servidor. Intenta más tarde.';
          this.cdr.detectChanges();
        }
      });
  }

  irLogin() {
    this.router.navigate(['/login']);
  }
}
