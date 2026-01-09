import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="list">
    <h2>HORARIOS RESERVADOS</h2>
    <div *ngFor="let h of horarios" class="item">{{h}}</div>
  </div>`,
  styles:[`.list{padding:20px}.item{background:#e6f4e6;margin:6px;padding:8px;border-radius:6px}`]
})
export class Horarios {
  horarios=['Lab A - Lun 07:30-10:30','Lab B - Mar 10:30-12:30'];
}
