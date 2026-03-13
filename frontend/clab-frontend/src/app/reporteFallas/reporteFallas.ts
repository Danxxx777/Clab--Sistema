import {ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReporteFallasService } from '../services/reporte-fallas.service';
import { Laboratorio, Equipo } from '../interfaces/ReporteFallas.model';

@Component({
  selector: 'app-reporte-fallas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
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

  filtroTexto: string = '';
  filtroCodLaboratorio: number | null = null;
  filtroIdEquipo: number | null = null;

  mostrarModal = false;
  mostrarModalDetalle = false;
  reporteDetalle: any = null;
  mostrarModalConfirmar = false;
  idAEliminar: number | null = null;

  drawerAbierto = false;
  rol = sessionStorage.getItem('rol') || '';
  usuarioLogueado = sessionStorage.getItem('usuario') || 'Usuario';
  cargando = false;

  mostrarToast = false;
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private reporteService: ReporteFallasService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.rol = sessionStorage.getItem('rol') || '';
    this.usuarioLogueado = sessionStorage.getItem('usuario') || 'Usuario';
    this.inicializarFormulario();
    this.cargarLaboratorios();
    this.cargarReportes();
  }

  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    this.ngZone.run(() => {
      this.toastMensaje = mensaje;
      this.toastTipo = tipo;
      this.mostrarToast = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.mostrarToast = false;
        this.cdr.detectChanges();
      }, 3000);
    });
  }

  inicializarFormulario(): void {
    this.reporteForm = this.fb.group({
      codLaboratorio: [null, Validators.required],
      idEquipo: [null, Validators.required],
      descripcionFalla: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  cargarLaboratorios(): void {
    this.http.get<Laboratorio[]>(`${this.API_URL}/laboratorios/listar`).subscribe({
      next: (data) => this.laboratorios = data,
      error: (err) => console.error('Error cargando laboratorios:', err)
    });
  }

  cargarEquiposPorLaboratorio(codLaboratorio: number): void {
    this.http.get<Equipo[]>(`${this.API_URL}/equipos/porLaboratorio/${codLaboratorio}`).subscribe({
      next: (data) => { this.equiposFiltrados = data; this.cdr.detectChanges(); },
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

  aplicarFiltros(): void {
    this.reportesFiltrados = this.reportes.filter(reporte => {
      const textoCoincide = !this.filtroTexto ||
        reporte.equipo.nombreEquipo.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        reporte.laboratorio.nombreLab.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        reporte.descripcionFalla.toLowerCase().includes(this.filtroTexto.toLowerCase());
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
    this.filtroIdEquipo = null;
    if (value) this.cargarEquiposPorLaboratorio(Number(value));
    else this.equiposFiltrados = [];
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
    this.reporteForm.reset({ codLaboratorio: null, idEquipo: null, descripcionFalla: '' });
    this.equiposFiltrados = [];
  }

  cerrarModal(): void {
    setTimeout(() => {
      this.mostrarModal = false;
      this.reporteForm.reset();
      this.equiposFiltrados = [];
      this.cdr.detectChanges();
    }, 100);
  }

  verDetalle(reporte: any): void {
    this.reporteDetalle = reporte;
    this.mostrarModalDetalle = true;
    this.cdr.detectChanges();
  }

  cerrarDetalle(): void {
    this.mostrarModalDetalle = false;
    this.reporteDetalle = null;
    this.cdr.detectChanges();
  }

  confirmarEliminar(id: number): void {
    this.idAEliminar = id;
    this.mostrarModalConfirmar = true;
    this.cdr.detectChanges();
  }

  cancelarEliminar(): void {
    this.idAEliminar = null;
    this.mostrarModalConfirmar = false;
    this.cdr.detectChanges();
  }

  ejecutarEliminar(): void {
    if (!this.idAEliminar) return;
    this.mostrarModalConfirmar = false;
    this.cdr.detectChanges();
    this.reporteService.eliminar(this.idAEliminar).subscribe({
      next: () => {
        this.mostrarNotificacion('✅ Reporte eliminado correctamente');
        this.cargarReportes();
        this.idAEliminar = null;
      },
      error: () => {
        this.mostrarNotificacion('❌ Error al eliminar el reporte', 'error');
        this.idAEliminar = null;
      }
    });
  }

  guardarReporte(): void {
    if (this.reporteForm.invalid) { this.reporteForm.markAllAsTouched(); return; }
    this.cargando = true;
    const reporteDTO = {
      codLaboratorio: Number(this.reporteForm.get('codLaboratorio')?.value),
      idEquipo: Number(this.reporteForm.get('idEquipo')?.value),
      descripcionFalla: this.reporteForm.get('descripcionFalla')?.value,
      idUsuario: Number(sessionStorage.getItem('idUsuario'))
    };
    this.reporteService.crear(reporteDTO).subscribe({
      next: () => {
        this.mostrarNotificacion('✅ Reporte creado correctamente');
        this.cerrarModal();
        this.cargarReportes();
        this.cargando = false;
      },
      error: () => {
        this.mostrarNotificacion('❌ Error al crear el reporte', 'error');
        this.cargando = false;
      }
    });
  }

  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }
  navegar(ruta: string, texto: string): void { this.cerrarDrawer(); this.router.navigate([`/${ruta}`]); }
  logout(): void { sessionStorage.clear(); this.router.navigate(['/login']); }
  volver(): void { this.router.navigate(['/dashboard']); }
  formatearFecha(fecha: any): string { if (!fecha) return ''; return new Date(fecha).toLocaleDateString('es-ES'); }
}
