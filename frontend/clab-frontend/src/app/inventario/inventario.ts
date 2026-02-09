import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { EquipoService, EquipoDTO } from '../services/equipo.service';
import { TipoEquipoService } from '../services/tipo-equipo.service';
import { LaboratorioService, Laboratorio } from '../services/laboratorio.service';



interface Equipo {
  id: number;
  noSerie: string;
  nombre: string;
  marca: string;
  modelo: string;
  tipoEquipo: string;      // nombreTipo
  laboratorio: string;     // nombreLab
  estado: string;
  fechaAdquisicion: string;
  ubicacionFisica: string;
}

interface TipoEquipo {
  id: number;
  nombre: string;
  descripcion: string;
}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrls: ['./inventario.scss']
})
export class InventarioComponent implements OnInit {



  tabActiva: 'equipos' | 'tipos' = 'equipos';

  equipos: Equipo[] = [];
  equiposFiltrados: Equipo[] = [];
  busquedaEquipos = '';

  tiposEquipo: TipoEquipo[] = [];
  tiposFiltrados: TipoEquipo[] = [];
  busquedaTipos = '';

  laboratorios: Laboratorio[] = [];



  mostrarModalEquipo = false;
  modoEdicionEquipo = false;
  idEditando: number | null = null;

  mostrarDetalleEquipo = false;
  equipoDetalle!: Equipo;



  formEquipo: Equipo = this.nuevoFormulario();

  constructor(
    private router: Router,
    private equipoService: EquipoService,
    private tipoEquipoService: TipoEquipoService,
    private laboratorioService: LaboratorioService
  ) {}

  ngOnInit(): void {
    this.cargarEquipos();
    this.cargarTipos();
    this.cargarLaboratorios();
  }



  cargarEquipos(): void {
    this.equipoService.listar().subscribe(data => {
      this.equipos = data.map(e => ({
        id: e.idEquipo,
        noSerie: e.numeroSerie,
        nombre: e.nombreEquipo,
        marca: e.marca,
        modelo: e.modelo,
        tipoEquipo: e.tipoEquipo.nombreTipo,
        laboratorio: e.laboratorio.nombreLab,
        estado: e.estado,
        fechaAdquisicion: e.fechaAdquisicion,
        ubicacionFisica: e.ubicacionFisica
      }));
      this.equiposFiltrados = [...this.equipos];
    });
  }

  cargarTipos(): void {
    this.tipoEquipoService.listar().subscribe(data => {
      this.tiposEquipo = data.map(t => ({
        id: t.idTipoEquipo,
        nombre: t.nombreTipo,
        descripcion: t.descripcion
      }));
      this.tiposFiltrados = [...this.tiposEquipo];
    });
  }

  cargarLaboratorios(): void {
    this.laboratorioService.listar().subscribe({
      next: data => {
        this.laboratorios = data;
      },
      error: err => {
        console.error('Error cargando laboratorios', err);
      }
    });
  }




  filtrarEquipos(): void {
    const b = this.busquedaEquipos.toLowerCase();
    this.equiposFiltrados = this.equipos.filter(e =>
      e.noSerie.toLowerCase().includes(b) ||
      e.nombre.toLowerCase().includes(b) ||
      e.tipoEquipo.toLowerCase().includes(b) ||
      e.laboratorio.toLowerCase().includes(b)
    );
  }

  filtrarTipos(): void {
    const b = this.busquedaTipos.toLowerCase();
    this.tiposFiltrados = this.tiposEquipo.filter(t =>
      t.nombre.toLowerCase().includes(b)
    );
  }



  abrirModalEquipo(): void {
    this.modoEdicionEquipo = false;
    this.idEditando = null;
    this.formEquipo = this.nuevoFormulario();
    this.mostrarModalEquipo = true;
  }

  editarEquipo(e: Equipo): void {
    this.modoEdicionEquipo = true;
    this.idEditando = e.id;
    this.formEquipo = { ...e };
    this.mostrarModalEquipo = true;
  }

  verEquipo(e: Equipo): void {
    this.equipoDetalle = { ...e };
    this.mostrarDetalleEquipo = true;
  }

  guardarEquipo(): void {

    if (
      !this.formEquipo.noSerie ||
      !this.formEquipo.nombre ||
      !this.formEquipo.tipoEquipo ||
      !this.formEquipo.laboratorio
    ) {
      alert('Complete los campos obligatorios');
      return;
    }

    const dto: EquipoDTO = {
      numeroSerie: this.formEquipo.noSerie,
      nombreEquipo: this.formEquipo.nombre,
      marca: this.formEquipo.marca,
      modelo: this.formEquipo.modelo,
      tipoEquipo: this.formEquipo.tipoEquipo,     // nombreTipo
      laboratorio: this.formEquipo.laboratorio,   // nombreLab
      estado: this.formEquipo.estado,
      ubicacionFisica: this.formEquipo.ubicacionFisica,
      fechaAdquisicion: this.formEquipo.fechaAdquisicion
    };

    if (this.modoEdicionEquipo && this.idEditando) {
      this.equipoService.editar(this.idEditando, dto).subscribe(() => {
        this.cargarEquipos();
        this.cerrarModalEquipo();
      });
    } else {
      this.equipoService.crear(dto).subscribe(() => {
        this.cargarEquipos();
        this.cerrarModalEquipo();
      });
    }
  }

  eliminarEquipo(e: Equipo): void {
    if (!confirm('¿Eliminar equipo?')) return;

    this.equipoService.eliminar(e.id).subscribe(() => {
      this.cargarEquipos();
    });
  }

  cerrarModalEquipo(): void {
    this.mostrarModalEquipo = false;
  }

  cerrarDetalleEquipo(): void {
    this.mostrarDetalleEquipo = false;
  }



  eliminarTipo(t: TipoEquipo): void {
    if (!confirm('¿Eliminar tipo?')) return;

    this.tipoEquipoService.eliminar(t.id).subscribe(() => {
      this.cargarTipos();
    });
  }
  abrirModalTipo(): void {
    this.modoEdicionTipo = false;
    this.idTipoEditando = null;
    this.formularioTipo = { nombre: '', descripcion: '' };
    this.mostrarModalTipo = true;
  }

  editarTipo(tipo: TipoEquipo): void {
    this.modoEdicionTipo = true;
    this.idTipoEditando = tipo.id;
    this.formularioTipo = { nombre: tipo.nombre, descripcion: tipo.descripcion };
    this.mostrarModalTipo = true;
  }

  guardarTipo(): void {
    if (!this.formularioTipo.nombre.trim()) {
      alert('El nombre del tipo es obligatorio');
      return;
    }

    const payload = {
      nombre: this.formularioTipo.nombre,
      descripcion: this.formularioTipo.descripcion
    };

    if (this.modoEdicionTipo && this.idTipoEditando) {
      this.tipoEquipoService.actualizar(this.idTipoEditando, payload).subscribe(() => {
        this.cargarTipos();
        this.cerrarModalTipo();
      });
    } else {
      this.tipoEquipoService.crear(payload).subscribe(() => {
        this.cargarTipos();
        this.cerrarModalTipo();
      });
    }
  }

  cerrarModalTipo(): void {
    this.mostrarModalTipo = false;
  }




  mostrarModalTipo = false;
  modoEdicionTipo = false;
  idTipoEditando: number | null = null;

  formularioTipo = {
    nombre: '',
    descripcion: ''
  };




  cambiarTab(tab: 'equipos' | 'tipos'): void {
    this.tabActiva = tab;
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  nuevoFormulario(): Equipo {
    return {
      id: 0,
      noSerie: '',
      nombre: '',
      marca: '',
      modelo: '',
      tipoEquipo: '',
      laboratorio: '',
      estado: 'OPERATIVO',
      fechaAdquisicion: '',
      ubicacionFisica: ''
    };
  }
}
