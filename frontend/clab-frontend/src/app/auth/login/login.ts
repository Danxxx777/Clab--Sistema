import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {

  username = '';
  password = '';

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  login() {
    this.auth.login();
    //alert('✅ Inicio de sesión exitoso');
    this.router.navigate(['/dashboard']);
  }
}
