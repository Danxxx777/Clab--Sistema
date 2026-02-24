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
  reportesFiltrados: any[] = [];

  //Variable de filtro
  filtroTexto: string = '';
  filtroCodLaboratorio: number | null = null;
  filtroIdEquipo: number | null = null;

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

  cargarLaboratorios(): void {
    this.http.get<Laboratorio[]>(`${this.API_URL}/laboratorios/listar`)
      .subscribe({
        next: (data) => this.laboratorios = data,
        error: (err) => console.error('Error cargando laboratorios:', err)
      });
  }

  cargarEquiposPorLaboratorio(codLaboratorio: number): void {
    const url = `${this.API_URL}/equipos/porLaboratorio/${codLaboratorio}`;
    this.http.get<Equipo[]>(url).subscribe({
      next: (data) => {
        this.equiposFiltrados = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando equipos:', err)
    });
  }

  cargarReportes(): void {
    this.reporteService.listar().subscribe({
      next: (data) => {
        this.reportes = data;
        this.reportesFiltrados = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al listar reportes:', err)
    });
  }

  //aplica todos los filtros
  aplicarFiltros(): void {
    this.reportesFiltrados = this.reportes.filter(reporte => {

      const textoCoincide = !this.filtroTexto ||
        reporte.equipo.nombreEquipo.toLowerCase()
          .includes(this.filtroTexto.toLowerCase()) ||
        reporte.laboratorio.nombreLab.toLowerCase()
          .includes(this.filtroTexto.toLowerCase()) ||
        reporte.descripcionFalla.toLowerCase()
          .includes(this.filtroTexto.toLowerCase());

      const laboratorioCoincide = !this.filtroCodLaboratorio ||
        reporte.laboratorio.codLaboratorio === Number(this.filtroCodLaboratorio);

      const equipoCoincide = !this.filtroIdEquipo ||
        reporte.equipo.idEquipo === Number(this.filtroIdEquipo);

      return textoCoincide && laboratorioCoincide && equipoCoincide;
    });

    this.cdr.detectChanges();
  }

  onFiltroLaboratorioChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filtroCodLaboratorio = value ? Number(value) : null;
    this.filtroIdEquipo = null; // Resetea filtro equipo

    if (value) {
      this.cargarEquiposPorLaboratorio(Number(value));
    } else {
      this.equiposFiltrados = [];
    }

    this.aplicarFiltros();
  }

  onFiltroEquipoChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filtroIdEquipo = value ? Number(value) : null;
    this.aplicarFiltros();
  }

  onFiltroTextoChange(event: Event): void {
    this.filtroTexto = (event.target as HTMLInputElement).value;
    this.aplicarFiltros();
  }

  onLaboratorioChange(): void {
    const cod = this.reporteForm.get('codLaboratorio')?.value;
    if (cod) {
      this.cargarEquiposPorLaboratorio(Number(cod));
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
    this.equiposFiltrados = [];
  }

  guardarReporte(): void {
    if (this.reporteForm.invalid) {
      this.reporteForm.markAllAsTouched();
      return;
    }

    this.cargando = true;

    const reporteDTO = {
      codLaboratorio: Number(this.reporteForm.get('codLaboratorio')?.value),
      idEquipo: Number(this.reporteForm.get('idEquipo')?.value),
      descripcionFalla: this.reporteForm.get('descripcionFalla')?.value,
      idUsuario: 1
    };

    this.reporteService.crear(reporteDTO).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarReportes();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error creando reporte:', err);
        this.cargando = false;
      }
    });
  }

  eliminarReporte(id: number): void {
    if (!confirm('¿Eliminar este reporte?')) return;

    this.reporteService.eliminar(id).subscribe({
      next: () => {
        this.cargarReportes();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error eliminando reporte:', err)
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  formatearFecha(fecha: any): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES');
  }
}
