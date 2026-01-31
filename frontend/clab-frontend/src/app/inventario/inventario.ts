import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Equipo {
  id: number;
  nombre: string;
  noSerie: string;
  estado: 'Operativo' | 'Mantenimiento' | 'Fuera de servicio';
  ubicacion: string;
  responsable: string;
}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario.html',
  styleUrls: ['./inventario.scss']
})
export class InventarioComponent implements OnInit {

  equipos: Equipo[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.equipos = [
      {
        id: 1,
        nombre: 'Computadora Dell',
        noSerie: 'D1001',
        estado: 'Operativo',
        ubicacion: 'Lab Comp A',
        responsable: 'Dr. García'
      },
      {
        id: 2,
        nombre: 'Microscopio Leica',
        noSerie: 'LC002',
        estado: 'Mantenimiento',
        ubicacion: 'Lab Biología',
        responsable: 'Dra. Ruiz'
      }
    ];
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }

  agregarEquipo() {
    alert('Abrir formulario de nuevo equipo - Por implementar');
  }

  editar(equipo: Equipo) {
    console.log('Editar equipo:', equipo);
    alert(`Editar equipo: ${equipo.nombre}`);
  }

  eliminar(equipo: Equipo) {
    if (confirm(`¿Seguro que deseas eliminar el equipo "${equipo.nombre}"?`)) {
      this.equipos = this.equipos.filter(e => e.id !== equipo.id);
      console.log('Equipo eliminado:', equipo);
    }
  }
}
