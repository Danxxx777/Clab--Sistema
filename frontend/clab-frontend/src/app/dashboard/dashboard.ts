import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TestService } from '../services/test.service';
import {NgIf} from '@angular/common';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  imports: [
    NgIf
  ],
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {

  mensajeBackend = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private testService: TestService,
    private cdr: ChangeDetectorRef
  ) {}

  rol: string | null = '';

  ngOnInit(): void {
    this.rol = localStorage.getItem('rol');

    console.log('Dashboard iniciado');

    this.testService.getTest().subscribe({
      next: (res) => {
        console.log('Respuesta backend:', res);
        this.mensajeBackend = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error backend:', err);
        this.mensajeBackend = 'No se pudo conectar con el backend';
        this.cdr.detectChanges();
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
      this.router.navigate(['reporte-fallas']);
  }

  protected asistencia(asistencia: string) {

  }

  protected estudiantes(estudiantes: string) {
    this.router.navigate(['estudiantes']);
  }

  protected academico(academico: string) {
    this.router.navigate(['academico']);
  }

  protected reservas(reservas: string) {

  }

  protected equipos(_: string) {
    this.router.navigate(['equipos']);
  }


  protected laboratorios(_: string) {
    this.router.navigate(['laboratorios']);
  }

  protected usuario(usuarios: string) {
    console.log('Navegando a usuarios');
    this.router.navigate(['usuarios']);
  }

}
