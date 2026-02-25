import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  idTipoEquipo: number;
  nombreTipoEquipo: string;

  codLaboratorio: number;
  nombreLaboratorio: string;

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
  drawerAbierto = false;
  rol = localStorage.getItem('rol') || '';
  usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';

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

  mostrarToast= false;
  toastMensaje= '';
  toastTipo: 'success' | 'error'= 'success';

  formEquipo: Equipo = this.nuevoFormulario();

  constructor(
    private router: Router,
    private equipoService: EquipoService,
    private tipoEquipoService: TipoEquipoService,
    private laboratorioService: LaboratorioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.rol = localStorage.getItem('rol') || '';
    this.usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';
    this.cargarEquipos();
    this.cargarTipos();
    this.cargarLaboratorios();
  }



  cargarEquipos(): void {
    this.equipoService.listar().subscribe({
      next: (data) => {
        this.equipos = data.map(e => ({
          id: e.idEquipo,
          noSerie: e.numeroSerie,
          nombre: e.nombreEquipo,
          marca: e.marca,
          modelo: e.modelo,

          idTipoEquipo: e.tipoEquipo.idTipoEquipo,
          nombreTipoEquipo: e.tipoEquipo.nombreTipo,
          codLaboratorio: e.laboratorio.codLaboratorio,
          nombreLaboratorio: e.laboratorio.nombreLab,
          estado: e.estado,
          fechaAdquisicion: e.fechaAdquisicion,
          ubicacionFisica: e.ubicacionFisica
        }));
        this.equiposFiltrados = [...this.equipos];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando equipos:', err);
        this.mostrarNotificacion('Error al cargar equipos', 'error');
      }
    });
  }

  cargarTipos(): void {
    this.tipoEquipoService.listar().subscribe({
      next: (data) => {
        this.tiposEquipo = data.map(t => ({
          id: t.idTipoEquipo,
          nombre: t.nombreTipo,
          descripcion: t.descripcion
        }));
        this.tiposFiltrados = [...this.tiposEquipo];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando tipos:', err);
        this.mostrarNotificacion('Error al cargar tipos', 'error');
      }
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

  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.mostrarToast = true;

    setTimeout(() => {
      this.mostrarToast = false;
      this.cdr.detectChanges();
    }, 2000);
  }



  filtrarEquipos(): void {
    const b = this.busquedaEquipos.toLowerCase();
    this.equiposFiltrados = this.equipos.filter(e =>
      e.noSerie.toLowerCase().includes(b) ||
      e.nombre.toLowerCase().includes(b) ||
      e.nombreTipoEquipo.toLowerCase().includes(b) ||
      e.nombreLaboratorio.toLowerCase().includes(b)
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
      !this.formEquipo.idTipoEquipo ||
      !this.formEquipo.codLaboratorio
    ) {
      this.mostrarNotificacion('Complete los campos obligatorios', 'error');
      return;
    }


    const dto: EquipoDTO = {
      numeroSerie: this.formEquipo.noSerie,
      nombreEquipo: this.formEquipo.nombre,
      marca: this.formEquipo.marca,
      modelo: this.formEquipo.modelo,
      idTipoEquipo: this.formEquipo.idTipoEquipo,
      codLaboratorio: this.formEquipo.codLaboratorio,
      estado: this.formEquipo.estado,
      ubicacionFisica: this.formEquipo.ubicacionFisica,
      fechaAdquisicion: this.formEquipo.fechaAdquisicion
    };



    if (this.modoEdicionEquipo && this.idEditando) {
      this.equipoService.editar(this.idEditando, dto).subscribe({
        next: () => {
          this.cargarEquipos();
          this.cerrarModalEquipo();
          this.mostrarNotificacion('Equipo actualizado correctamente');
        },
        error: (err) => {
          console.error('Error editando equipo:', err);
          this.mostrarNotificacion('Error al actualizar equipo', 'error');
        }
      });
      return;
    }


    this.equipoService.crear(dto).subscribe({
      next: () => {
        this.cargarEquipos();
        this.cerrarModalEquipo();
        this.mostrarNotificacion('Equipo creado correctamente');
      },
      error: (err) => {
        console.error('Error creando equipo:', err);
        this.mostrarNotificacion('Error al crear equipo', 'error');
      }
    });
  }


  eliminarEquipo(e: Equipo): void {
    if (!confirm('¿Eliminar equipo?')) return;

    this.equipoService.eliminar(e.id).subscribe({
      next: () => {
        this.cargarEquipos();
        this.mostrarNotificacion('🗑Equipo eliminado correctamente');
      },
      error: (err) => {
        console.error('Error eliminando equipo:', err);
        this.mostrarNotificacion('Error al eliminar equipo', 'error');
      }
    });
  }

  cerrarModalEquipo(): void {
    this.mostrarModalEquipo = false;
  }

  cerrarDetalleEquipo(): void {
    this.mostrarDetalleEquipo = false;
  }



  eliminarTipo(t: TipoEquipo): void {
    if (!confirm('¿Eliminar tipo de equipo?')) return;

    this.tipoEquipoService.eliminar(t.id).subscribe({
      next: () => {
        this.cargarTipos();
        this.mostrarNotificacion('Tipo de equipo eliminado');
      },
      error: (err) => {
        console.error('Error eliminando tipo:', err);
        this.mostrarNotificacion('Error al eliminar tipo', 'error');
      }
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
      this.mostrarNotificacion('El nombre del tipo es obligatorio', 'error');
      return;
    }

    const payload = {
      nombre: this.formularioTipo.nombre,
      descripcion: this.formularioTipo.descripcion
    };

    if (this.modoEdicionTipo && this.idTipoEditando) {
      this.tipoEquipoService.actualizar(this.idTipoEditando, payload).subscribe({
        next: () => {
          this.cargarTipos();
          this.cerrarModalTipo();
          this.mostrarNotificacion('Tipo de equipo actualizado');
        },
        error: (err) => {
          console.error('Error actualizando tipo:', err);
          this.mostrarNotificacion('Error al actualizar tipo', 'error');
        }
      });
      return;
    }

    this.tipoEquipoService.crear(payload).subscribe({
      next: () => {
        this.cargarTipos();
        this.cerrarModalTipo();
        this.mostrarNotificacion('Tipo de equipo creado');
      },
      error: (err) => {
        console.error('Error creando tipo:', err);
        this.mostrarNotificacion('Error al crear tipo', 'error');
      }
    });
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
  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }

  navegar(ruta: string, texto: string): void {
    this.cerrarDrawer();
    this.router.navigate([`/${ruta}`]);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
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
      idTipoEquipo: 0,
      nombreTipoEquipo: '',
      codLaboratorio: 0,
      nombreLaboratorio: '',
      estado: 'OPERATIVO',
      fechaAdquisicion: '',
      ubicacionFisica: ''
    };
  }
}
