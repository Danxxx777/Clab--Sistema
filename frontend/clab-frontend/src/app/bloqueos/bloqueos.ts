import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Bloqueo {
  id: number;
  laboratorio: string;
  fechaInicio: string;
  fechaFin: string;
  horario: string;
  motivo: string;
}

@Component({
  selector: 'app-bloqueos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bloqueos.html',
  styleUrls: ['./bloqueos.scss']
})
export class BloqueosComponent implements OnInit {

  bloqueos: Bloqueo[] = [];

  drawerAbierto = false;
  rol = localStorage.getItem('rol') || '';
  usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';

  constructor(private router: Router) {}

  ngOnInit() {
    this.rol = localStorage.getItem('rol') || '';
    this.usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';

    this.bloqueos = [
      {
        id: 1,
        laboratorio: 'Lab Computación B',
        fechaInicio: '2024-10-20',
        fechaFin: '2024-10-22',
        horario: '14:00 - 18:00',
        motivo: 'Mantenimiento general'
      }
    ];
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

  volver() {
    this.router.navigate(['/dashboard']);
  }

  crearBloqueo() {
    alert('Abrir formulario de nuevo bloqueo - Por implementar');
  }

  editar(bloqueo: Bloqueo) {
    alert(`Editar bloqueo de ${bloqueo.laboratorio}`);
  }

  ver(bloqueo: Bloqueo) {
    alert(`Detalles:\nLab: ${bloqueo.laboratorio}\nMotivo: ${bloqueo.motivo}`);
  }

  eliminar(bloqueo: Bloqueo) {
    if (confirm(`¿Eliminar el bloqueo de "${bloqueo.laboratorio}"?`)) {
      this.bloqueos = this.bloqueos.filter(b => b.id !== bloqueo.id);
    }
  }
}
