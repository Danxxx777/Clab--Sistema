import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reportar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="card">
    <h2>REPORTAR FALLAS</h2>
    <input placeholder="Equipo">
    <textarea placeholder="Descripción"></textarea>
    <button (click)="enviar()">Enviar</button>
  </div>`,
  styles:[`.card{max-width:380px;margin:40px auto}`]
})
export class Reportar {
  enviar(){ alert('Reporte enviado'); }
}
