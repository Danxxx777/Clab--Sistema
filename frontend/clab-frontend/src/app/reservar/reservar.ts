import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Reserva {
  id: number;
  laboratorio: string;
  fecha: string;
  horario: string;
  asignatura: string;
  responsable: string;
  estado: 'Confirmada' | 'Pendiente' | 'Cancelada';
}

@Component({
  selector: 'app-reservar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservar.html',
  styleUrls: ['./reservar.scss']
})
export class ReservarComponent implements OnInit {

  reservas: Reserva[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // Datos de ejemplo
    this.reservas = [
      {
        id: 1,
        laboratorio: 'Lab Computación A',
        fecha: '2024-10-15',
        horario: '08:00-10:00',
        asignatura: 'Programación I',
        responsable: 'Dr. García',
        estado: 'Confirmada'
      },
      {
        id: 2,
        laboratorio: 'Lab Física',
        fecha: '2024-10-15',
        horario: '10:00-12:00',
        asignatura: 'Física Experimental',
        responsable: 'Dra. López',
        estado: 'Pendiente'
      }
    ];
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }

  importarHorarios() {
    alert('Función de importar horarios - Por implementar');
  }

  nuevaReserva() {
    alert('Abrir formulario de nueva reserva - Por implementar');
  }

  editar(reserva: Reserva) {
    console.log('Editar reserva:', reserva);
    alert(`Editar reserva de ${reserva.laboratorio}`);
  }

  eliminar(reserva: Reserva) {
    if (confirm(`¿Seguro que deseas eliminar la reserva de ${reserva.laboratorio}?`)) {
      this.reservas = this.reservas.filter(r => r.id !== reserva.id);
      console.log('Reserva eliminada:', reserva);
    }
  }
}
