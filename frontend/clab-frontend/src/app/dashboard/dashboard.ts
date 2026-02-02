import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TestService } from '../services/test.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {

  mensajeBackend = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private testService: TestService
  ) {}

  ngOnInit(): void {
    console.log('Dashboard iniciado');

    this.testService.getTest().subscribe({
      next: (res) => {
        console.log('Respuesta backend:', res);
        this.mensajeBackend = res;
      },
      error: (err) => {
        console.error('Error backend:', err);
        this.mensajeBackend = 'No se pudo conectar con el backend';
      }
    });
  }

  goTo(path: string) {
    console.log('Navegando a:', path);
    this.router.navigate([path]);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  protected auditoria(auditoria: string) {

  }

  protected reportesuso(reportesuso: string) {

  }

  protected notificaciones(notificaciones: string) {

  }

  protected bloqueos(bloqueos: string) {

  }

  protected fallas(fallas: string) {

  }

  protected asistencia(asistencia: string) {

  }

  protected estudiantes(estudiantes: string) {

  }

  protected academico(academico: string) {

  }

  protected reservas(reservas: string) {

  }

  protected equipos(_: string) {
    this.router.navigate(['equipos']);
  }


  protected laboratorios(laboratorios: string) {

  }

  protected usuario(usuarios: string) {

  }
}
