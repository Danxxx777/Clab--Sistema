import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReporteFallasService } from '../services/reporte-fallas.service';


interface Laboratorio {
  codLaboratorio: number;
  nombreLab: string;
}

interface Equipo {
  idEquipo: number;
  nombreEquipo: string;
  marca: string;
  modelo: string;
  laboratorio: Laboratorio;
}

@Component({
  selector: 'app-reporte-fallas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  templateUrl: './reporteFallas.html',
  styleUrls: ['./reporteFallas.scss']
})
export class ReporteFallasComponent implements OnInit {

  private API_URL = 'http://localhost:8080';

  reporteForm!: FormGroup;

  laboratorios: Laboratorio[] = [];
  equiposFiltrados: Equipo[] = [];
  reportes: any[] = [];

  mostrarModal = false;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private reporteService: ReporteFallasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarLaboratorios();
    this.cargarReportes();
  }

  inicializarFormulario(): void {
    this.reporteForm = this.fb.group({
      codLaboratorio: [null, Validators.required],
      idEquipo: [null, Validators.required],
      descripcionFalla: [
        '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(500)]
      ]
    });
  }

  /*
     CARGA DATOS
   */

  cargarLaboratorios(): void {
    this.http.get<Laboratorio[]>(`${this.API_URL}/laboratorios/listar`)
      .subscribe({
        next: (data) => this.laboratorios = data,
        error: (err) => console.error(err)
      });
  }

  cargarEquiposPorLaboratorio(codLaboratorio: number): void {
    this.http.get<Equipo[]>(`${this.API_URL}/equipos/porLaboratorio/${codLaboratorio}`)
      .subscribe({
        next: (data) => this.equiposFiltrados = data,
        error: (err) => console.error(err)
      });
  }

  cargarReportes(): void {
    this.reporteService.listar().subscribe({
      next: (data) => this.reportes = data,
      error: (err) => console.error(err)
    });
  }

  /*
     EVENTOS
   */

  onLaboratorioChange(): void {
    const cod = this.reporteForm.get('codLaboratorio')?.value;

    if (cod) {
      this.cargarEquiposPorLaboratorio(cod);
      this.reporteForm.patchValue({ idEquipo: null });
    } else {
      this.equiposFiltrados = [];
    }
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.reporteForm.reset();
    this.equiposFiltrados = [];
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.reporteForm.reset();
  }

  guardarReporte(): void {

    if (this.reporteForm.invalid) {
      this.reporteForm.markAllAsTouched();
      return;
    }

    this.cargando = true;

    const reporteDTO = {
      ...this.reporteForm.value,
      idUsuario: 1
    };

    this.reporteService.crear(reporteDTO).subscribe({
      next: () => {
        this.cargarReportes();
        this.cerrarModal();
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  eliminarReporte(id: number): void {

    if (!confirm('¿Eliminar este reporte?')) return;

    this.reporteService.eliminar(id).subscribe({
      next: () => this.cargarReportes(),
      error: (err) => console.error(err)
    });
  }

  volver(): void {

    this.router.navigate(['/dashboard']);

  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }
}
