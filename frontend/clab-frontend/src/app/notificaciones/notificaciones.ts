import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.scss']
})
export class NotificacionesComponent implements OnInit {

  drawerAbierto = false;
  rol = localStorage.getItem('rol') || '';
  usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.rol = localStorage.getItem('rol') || '';
    this.usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';
  }

  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }

  navegar(ruta: string, texto: string): void {
    this.cerrarDrawer();
    this.router.navigate([`/${ruta}`]);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }
}
