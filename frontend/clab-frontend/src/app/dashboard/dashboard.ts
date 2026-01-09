import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent {

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  goTo(path: string) {
    this.router.navigate(['/' + path]);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
