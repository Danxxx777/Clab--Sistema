import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('ReporteFallasComponent iniciado');
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
  onFiltroLaboratorioChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    if (!value) {
      this.equiposFiltrados = [];
      return;
    }
    const codLaboratorio = Number(value);
    this.cargarEquiposPorLaboratorio(codLaboratorio);
  }
  cargarLaboratorios(): void {
    this.http.get<Laboratorio[]>(`${this.API_URL}/laboratorios/listar`)
      .subscribe({
        next: (data) => this.laboratorios = data,
        error: (err) => console.error(err)
      });
  }
  cargarEquiposPorLaboratorio(codLaboratorio: number): void {

    const url = `${this.API_URL}/equipos/porLaboratorio/${codLaboratorio}`;
    console.log('Llamando a:', url);

    this.http.get<Equipo[]>(url)
      .subscribe({
        next: (data) => {
          console.log('Equipos recibidos:', data);
          this.equiposFiltrados = data;
        },
        error: (err) => {
          console.error('Error HTTP:', err);
        }
      });
  }
  cargarReportes(): void {
    console.log('Cargando reportes...');

    this.reporteService.listar().subscribe({
      next: (data) => {
        console.log('Reportes recibidos:', data);
        this.reportes = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al listar reportes:', err)
    });
  }


  /*
     EVENTOS
   */

  onLaboratorioChange(): void {
    const cod = this.reporteForm.get('codLaboratorio')?.value;

    if (cod) {
      const codNumero = Number(cod);
      console.log('Laboratorio seleccionado:', codNumero);
      this.cargarEquiposPorLaboratorio(codNumero);
      this.reporteForm.patchValue({ idEquipo: null });
    } else {
      this.equiposFiltrados = [];
    }
  }


  abrirModal(): void {
    this.mostrarModal = true;

    this.reporteForm.reset({
      codLaboratorio: null,
      idEquipo: null,
      descripcionFalla: ''
    });

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

    const idUsuario = Number(localStorage.getItem('idUsuario'));

    const reporteDTO = {
      ...this.reporteForm.value,
      idUsuario: 1
    };


    this.reporteService.crear(reporteDTO).subscribe({
      next: (nuevoReporte) => {


        this.reportes.push(nuevoReporte);

        this.cdr.detectChanges();

        this.reporteForm.reset({
          codLaboratorio: null,
          idEquipo: null,
          descripcionFalla: ''
        });

        this.equiposFiltrados = [];
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
      next: () => {
        console.log('Eliminado del backend, ID:', id);
        console.log('Reportes ANTES:', this.reportes.length);
        this.reportes = [...this.reportes.filter(r => r.idReporte !== id)];

        console.log('Reportes DESPUÉS:', this.reportes.length);

        this.cdr.detectChanges();

        this.cdr.markForCheck();
      },
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
