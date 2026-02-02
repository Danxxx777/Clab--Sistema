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

  constructor(private router: Router) {}

  ngOnInit() {
    // Datos de ejemplo - luego los reemplazas con tu servicio
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

  volver() {
    this.router.navigate(['/dashboard']);
  }

  crearBloqueo() {
    alert('Abrir formulario de nuevo bloqueo - Por implementar');
    // Aquí puedes navegar a otro componente o abrir un modal
  }

  editar(bloqueo: Bloqueo) {
    console.log('Editar bloqueo:', bloqueo);
    alert(`Editar bloqueo de ${bloqueo.laboratorio}`);
    // Aquí irá la lógica para editar
  }

  ver(bloqueo: Bloqueo) {
    console.log('Ver detalles:', bloqueo);
    alert(`Detalles del bloqueo:\n\nLab: ${bloqueo.laboratorio}\nMotivo: ${bloqueo.motivo}\nHorario: ${bloqueo.horario}`);
  }

  eliminar(bloqueo: Bloqueo) {
    if (confirm(`¿Seguro que deseas eliminar el bloqueo de "${bloqueo.laboratorio}"?`)) {
      this.bloqueos = this.bloqueos.filter(b => b.id !== bloqueo.id);
      console.log('Bloqueo eliminado:', bloqueo);
    }
  }
}
