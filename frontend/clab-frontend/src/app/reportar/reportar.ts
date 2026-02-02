import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Reporte {
  id: number;
  laboratorio: string;
  equipo: string;
  problema: string;
  responsable: string;
  estado: 'Pendiente' | 'En Proceso' | 'Resuelto';
  fecha: string;
}

@Component({
  selector: 'app-reportar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportar.html',
  styleUrls: ['./reportar.scss']
})
export class ReportarComponent implements OnInit {

  reportes: Reporte[] = [];
  reportesFiltrados: Reporte[] = [];
  filtroEstado: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    // Datos de ejemplo - luego los reemplazas con tu servicio
    this.reportes = [
      {
        id: 1,
        laboratorio: 'Lab Computación A',
        equipo: 'Computadora Dell',
        problema: 'No enciende',
        responsable: 'Dr. García',
        estado: 'Pendiente',
        fecha: '2024-10-14'
      },
      {
        id: 2,
        laboratorio: 'Lab Física',
        equipo: 'Osciloscopio',
        problema: 'Pantalla dañada',
        responsable: 'Dra. López',
        estado: 'En Proceso',
        fecha: '2024-10-13'
      }
    ];
    this.reportesFiltrados = [...this.reportes];
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }

  filtrarReportes() {
    if (this.filtroEstado === '') {
      this.reportesFiltrados = [...this.reportes];
    } else {
      this.reportesFiltrados = this.reportes.filter(
        r => r.estado.toLowerCase() === this.filtroEstado.toLowerCase()
      );
    }
  }

  getEstadoClass(estado: string): string {
    return estado.toLowerCase().replace(' ', '-');
  }

  editar(reporte: Reporte) {
    console.log('Editar reporte:', reporte);
    alert(`Editar reporte #${reporte.id}`);

  }

  ver(reporte: Reporte) {
    console.log('Ver detalles:', reporte);
    alert(`Ver detalles del reporte #${reporte.id}\n\nProblema: ${reporte.problema}\nEquipo: ${reporte.equipo}`);

  }
}
