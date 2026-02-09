import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './informes.html',
  styleUrls: ['./informes.scss']
})
export class InformesComponent {

  reporteUso = {
    periodo: 'semanal',
    laboratorio: 'todos'
  };

  reporteFallas = {
    periodo: 'ultima-semana',
    estado: 'todos'
  };

  reporteInventario = {
    tipo: 'completo',
    laboratorio: 'todos'
  };

  constructor(private router: Router) {}

  volver() {
    this.router.navigate(['/dashboard']);
  }

  generarReporteUso() {
    console.log('Generando reporte de uso:', this.reporteUso);
    alert(`Generando reporte de uso de laboratorios\n\nPeríodo: ${this.reporteUso.periodo}\nLaboratorio: ${this.reporteUso.laboratorio}\n\nEsta función estará conectada al backend para generar el PDF.`);
    // Aquí irá la lógica para llamar al backend y generar el PDF
  }

  generarReporteFallas() {
    console.log('Generando reporte de fallas:', this.reporteFallas);
    alert(`Generando reporte de fallas\n\nPeríodo: ${this.reporteFallas.periodo}\nEstado: ${this.reporteFallas.estado}\n\nEsta función estará conectada al backend para generar el PDF.`);
    // Aquí irá la lógica para llamar al backend y generar el PDF
  }

  generarReporteInventario() {
    console.log('Generando reporte de inventario:', this.reporteInventario);
    alert(`Generando reporte de inventario\n\nTipo: ${this.reporteInventario.tipo}\nLaboratorio: ${this.reporteInventario.laboratorio}\n\nEsta función estará conectada al backend para generar el PDF.`);
    // Aquí irá la lógica para llamar al backend y generar el PDF
  }
}
