import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.scss']
})
export class NotificacionesComponent {

  constructor(private router: Router) {}

  volver() {
    this.router.navigate(['/dashboard']);
  }
}
