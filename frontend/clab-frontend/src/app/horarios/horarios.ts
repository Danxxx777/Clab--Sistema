import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './horarios.html',
  styleUrls: ['./horarios.scss']
})
export class HorariosComponent {

  constructor(private router: Router) {}

  volver() {
    this.router.navigate(['/dashboard']);
  }
}
