import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reportar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportar.html',
  styleUrls: ['./reportar.scss']
})
export class ReportarComponent {

  equipo = '';
  descripcion = '';

  constructor(private router: Router) {}

  enviar() {
    alert('Reporte enviado correctamente');
    this.equipo = '';
    this.descripcion = '';
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }
}
