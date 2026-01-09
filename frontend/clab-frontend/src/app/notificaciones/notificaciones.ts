import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="list">
    <h2>NOTIFICACIONES</h2>
    <div *ngFor="let n of notas" class="item">{{n}}</div>
  </div>`,
  styles:[`.item{background:#dff0d8;margin:6px;padding:8px;border-radius:6px}`]
})
export class Notificaciones {
  notas=['Nueva falla detectada','Reporte resuelto'];
}
