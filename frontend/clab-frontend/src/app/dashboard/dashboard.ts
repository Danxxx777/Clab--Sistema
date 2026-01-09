import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent {

  constructor(private router: Router) {}

  goTo(path: string) {
    this.router.navigate(['/' + path]);
  }

  logout() {
    // aquí luego irá la limpieza de sesión
    this.router.navigate(['/']); // vuelve al login
  }
}
