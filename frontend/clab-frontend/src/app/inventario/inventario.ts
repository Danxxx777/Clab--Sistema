import { TipoEquipoService, TipoEquipoDTO } from '../services/tipo-equipo.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';


interface Equipo {
  id: number;
  nombre: string;
  tipoEquipo: string;
  marca: string;
  modelo: string;
  noSerie: string;
  estado: string;
  fechaAdquisicion: string;
  ultimaRevision: string;
  laboratorio: string;
  ubicacionFisica: string;
  //responsable: string;
  foto: string | null;
  descripcion: string;
}

interface TipoEquipo {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  equipos: number;
}

interface Laboratorio {
  id: number;
  nombre: string;
}

//interface Responsable {
  //id: number;
  //nombre: string;
//}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrls: ['./inventario.scss']
})
export class InventarioComponent implements OnInit{

  tabActiva: 'equipos' | 'tipos' = 'equipos';
  vista: 'grid' | 'list' = 'grid';
  formTabActiva: 'datos' | 'ubicacion' | 'imagen' = 'datos';


  equipos: Equipo[] = [

  ];

  equiposFiltrados: Equipo[] = [...this.equipos];
  busquedaEquipos = '';

  // Datos para tipos de equipo
  tiposEquipo: TipoEquipo[] = [
    { id: 1, nombre: 'Computadora', descripcion: 'Equipos de cómputo de escritorio', icono: '💻', equipos: 5 },
    { id: 2, nombre: 'Laptop', descripcion: 'Computadoras portátiles', icono: '💻', equipos: 3 },
    { id: 3, nombre: 'Impresora', descripcion: 'Equipos de impresión', icono: '🖨️', equipos: 2 },
    { id: 4, nombre: 'Proyector', descripcion: 'Proyectores multimedia', icono: '📽️', equipos: 1 },
    { id: 5, nombre: 'Microscopio', descripcion: 'Equipos de laboratorio biológico', icono: '🔬', equipos: 1 }
  ];

  tiposFiltrados: TipoEquipo[] = [...this.tiposEquipo];
  busquedaTipos = '';


  laboratorios: Laboratorio[] = [
    { id: 1, nombre: 'Lab Comp A' },
    { id: 2, nombre: 'Lab Comp B' },
    { id: 3, nombre: 'Lab Biología' },
    { id: 4, nombre: 'Lab Química' },
    { id: 5, nombre: 'Lab Física' },
    { id: 6, nombre: 'Lab Electrónica' }
  ];

  //responsables: Responsable[] = [
    //{ id: 1, nombre: 'Dr. García' },
    //{ id: 2, nombre: 'Dra. Ruiz' },
    //{ id: 3, nombre: 'Ing. Martínez' },
    //{ id: 4, nombre: 'Lic. Pérez' },
    //{ id: 5, nombre: 'Mtro. López' }
  //];

  iconos = ['💻', '🖥️', '💾', '🖨️', '📽️', '🔬', '🔭', '⚗️', '📡', '🔌', '🔋', '⌨️'];


  mostrarModalEquipo = false;
  modoEdicionEquipo = false;
  equipoEditandoId: number | null = null;

  formularioEquipo: Equipo = {
    id: 0,
    nombre: '',
    tipoEquipo: '',
    marca: '',
    modelo: '',
    noSerie: '',
    estado: 'OPERATIVO',
    fechaAdquisicion: '',
    ultimaRevision: '',
    laboratorio: '',
    ubicacionFisica: '',
    //responsable: '',
    foto: null,
    descripcion: ''
  };


  mostrarModalTipo = false;
  modoEdicionTipo = false;
  tipoEditandoId: number | null = null;

  formularioTipo: TipoEquipo = {
    id: 0,
    nombre: '',
    descripcion: '',
    icono: '💻',
    equipos: 0
  };


  mostrarDetalleEquipo = false;
  equipoSeleccionado: Equipo = {
    id: 0,
    nombre: '',
    tipoEquipo: '',
    marca: '',
    modelo: '',
    noSerie: '',
    estado: '',
    fechaAdquisicion: '',
    ultimaRevision: '',
    laboratorio: '',
    ubicacionFisica: '',
    //responsable: '',
    foto: null,
    descripcion: ''
  };


  mostrarConfirmarEliminar = false;
  itemParaEliminar: Equipo | TipoEquipo | null = null;
  tipoEliminacion: 'equipo' | 'tipo' = 'equipo';

  constructor(
    private router: Router,
    private tipoEquipoService: TipoEquipoService
  ) {}
  ngOnInit(): void {
    this.cargarTiposEquipo();
  }
  cargarTiposEquipo(): void {
    this.tipoEquipoService.listar().subscribe({
      next: (data) => {
        this.tiposEquipo = data.map(t => ({
          id: t.idTipoEquipo,
          nombre: t.nombreTipo,
          descripcion: t.descripcion,
          icono: '💻',
          equipos: 0
        }));
        this.tiposFiltrados = [...this.tiposEquipo];
      },
      error: () => {
        alert('Error al cargar tipos de equipo');
      }
    });
  }





  cambiarTab(tab: 'equipos' | 'tipos'): void {
    this.tabActiva = tab;
  }

  cambiarVista(vista: 'grid' | 'list'): void {
    this.vista = vista;
  }

  getTextoBoton(): string {
    switch(this.tabActiva) {
      case 'equipos': return 'Equipo';
      case 'tipos': return 'Tipo';
      default: return '';
    }
  }

// cha madre loco
  agregarNuevo(): void {
    switch (this.tabActiva) {
      case 'equipos':
        this.abrirModalEquipo();
        break;
      case 'tipos':
        this.abrirModalTipo();
        break;
    }
  }


  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  // Métodos de filtrado
  filtrarEquipos(): void {
    const busqueda = this.busquedaEquipos.toLowerCase();
    this.equiposFiltrados = this.equipos.filter(equipo =>
      equipo.nombre.toLowerCase().includes(busqueda) ||
      equipo.tipoEquipo.toLowerCase().includes(busqueda) ||
      equipo.marca.toLowerCase().includes(busqueda) ||
      equipo.noSerie.toLowerCase().includes(busqueda) ||
      equipo.laboratorio.toLowerCase().includes(busqueda) ||
      equipo.modelo.toLowerCase().includes(busqueda)
    );
  }

  filtrarTipos(): void {
    const busqueda = this.busquedaTipos.toLowerCase();
    this.tiposFiltrados = this.tiposEquipo.filter(tipo =>
      tipo.nombre.toLowerCase().includes(busqueda) ||
      (tipo.descripcion && tipo.descripcion.toLowerCase().includes(busqueda))
    );
  }


  abrirModalEquipo(): void {
    this.modoEdicionEquipo = false;
    this.equipoEditandoId = null;
    this.formTabActiva = 'datos';
    this.limpiarFormularioEquipo();
    this.mostrarModalEquipo = true;
  }

  editarEquipo(equipo: Equipo): void {
    this.modoEdicionEquipo = true;
    this.equipoEditandoId = equipo.id;
    this.formTabActiva = 'datos';

    this.formularioEquipo = {
      id: equipo.id,
      nombre: equipo.nombre,
      tipoEquipo: equipo.tipoEquipo,
      marca: equipo.marca,
      modelo: equipo.modelo,
      noSerie: equipo.noSerie,
      estado: equipo.estado,
      fechaAdquisicion: equipo.fechaAdquisicion,
      ultimaRevision: equipo.ultimaRevision,
      laboratorio: equipo.laboratorio,
      ubicacionFisica: equipo.ubicacionFisica,
      //responsable: equipo.responsable,
      foto: equipo.foto,
      descripcion: equipo.descripcion
    };

    this.mostrarModalEquipo = true;
  }

  verDetalleEquipo(equipo: Equipo): void {
    this.equipoSeleccionado = { ...equipo };
    this.mostrarDetalleEquipo = true;
  }

  cerrarDetalleEquipo(): void {
    this.mostrarDetalleEquipo = false;
    this.equipoSeleccionado = {
      id: 0,
      nombre: '',
      tipoEquipo: '',
      marca: '',
      modelo: '',
      noSerie: '',
      estado: '',
      fechaAdquisicion: '',
      ultimaRevision: '',
      laboratorio: '',
      ubicacionFisica: '',
      //responsable: '',
      foto: null,
      descripcion: ''
    };
  }

  eliminarEquipo(equipo: Equipo): void {
    this.itemParaEliminar = equipo;
    this.tipoEliminacion = 'equipo';
    this.mostrarConfirmarEliminar = true;
  }

  guardarEquipo(): void {
    if (!this.validarFormularioEquipo()) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (this.modoEdicionEquipo && this.equipoEditandoId) {
      const index = this.equipos.findIndex(e => e.id === this.equipoEditandoId);
      if (index !== -1) {
        this.equipos[index] = { ...this.formularioEquipo };
      }
    } else {
      const nuevoId = Math.max(...this.equipos.map(e => e.id), 0) + 1;
      this.equipos.push({
        ...this.formularioEquipo,
        id: nuevoId
      });
    }

    this.filtrarEquipos();
    this.cerrarModalEquipo();
    alert(`Equipo ${this.modoEdicionEquipo ? 'actualizado' : 'agregado'} correctamente`);
  }

  limpiarFormularioEquipo(): void {
    this.formularioEquipo = {
      id: 0,
      nombre: '',
      tipoEquipo: '',
      marca: '',
      modelo: '',
      noSerie: '',
      estado: 'OPERATIVO',
      fechaAdquisicion: '',
      ultimaRevision: '',
      laboratorio: '',
      ubicacionFisica: '',
      //responsable: '',
      foto: null,
      descripcion: ''
    };
  }

  validarFormularioEquipo(): boolean {
    const camposRequeridos = [
      this.formularioEquipo.noSerie,
      this.formularioEquipo.nombre,
      this.formularioEquipo.marca,
      this.formularioEquipo.modelo,
      this.formularioEquipo.tipoEquipo,
      this.formularioEquipo.ubicacionFisica,
      this.formularioEquipo.laboratorio,
      //this.formularioEquipo.responsable,
      this.formularioEquipo.fechaAdquisicion
    ];

    return camposRequeridos.every(campo => campo && campo.toString().trim() !== '');
  }


  abrirModalTipo(): void {
    this.modoEdicionTipo = false;
    this.tipoEditandoId = null;
    this.limpiarFormularioTipo();
    this.mostrarModalTipo = true;
  }

  editarTipo(tipo: TipoEquipo): void {
    this.modoEdicionTipo = true;
    this.tipoEditandoId = tipo.id;
    this.formularioTipo = { ...tipo };
    this.mostrarModalTipo = true;
  }

  eliminarTipo(tipo: TipoEquipo): void {
    this.itemParaEliminar = tipo;
    this.tipoEliminacion = 'tipo';
    this.mostrarConfirmarEliminar = true;
  }

  guardarTipo(): void {
    if (!this.formularioTipo.nombre.trim()) {
      alert('El nombre del tipo es requerido');
      return;
    }

    const payload = {
      nombre: this.formularioTipo.nombre,
      descripcion: this.formularioTipo.descripcion
    };

    if (this.modoEdicionTipo && this.tipoEditandoId) {
      this.tipoEquipoService.actualizar(this.tipoEditandoId, payload).subscribe({
        next: () => {
          this.cargarTiposEquipo();
          this.cerrarModalTipo();
          alert('Tipo actualizado correctamente');
        },
        error: () => alert('Error al actualizar tipo')
      });
    } else {
      this.tipoEquipoService.crear(payload).subscribe({
        next: () => {
          this.cargarTiposEquipo();
          this.cerrarModalTipo();
          alert('Tipo creado correctamente');
        },
        error: () => alert('Error al crear tipo')
      });
    }
  }


  limpiarFormularioTipo(): void {
    this.formularioTipo = {
      id: 0,
      nombre: '',
      descripcion: '',
      icono: '💻',
      equipos: 0
    };
  }


  cambiarFormTab(direccion: 'prev' | 'next'): void {
    const tabs: ('datos' | 'ubicacion' | 'imagen')[] = ['datos', 'ubicacion', 'imagen'];
    const currentIndex = tabs.indexOf(this.formTabActiva);

    if (direccion === 'prev' && currentIndex > 0) {
      this.formTabActiva = tabs[currentIndex - 1];
    } else if (direccion === 'next' && currentIndex < tabs.length - 1) {
      this.formTabActiva = tabs[currentIndex + 1];
    }
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (file.size > 5 * 1024 * 1024) { // 5MB límite
        alert('La imagen es demasiado grande. Máximo 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Por favor seleccione un archivo de imagen');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.formularioEquipo.foto = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  eliminarImagen(): void {
    this.formularioEquipo.foto = null;
  }

  getIconoTipo(nombre: string): string {
    const tipo = this.tiposEquipo.find(t => t.nombre === nombre);
    return tipo?.icono || '🏷️';
  }


  cerrarModalEquipo(): void {
    this.mostrarModalEquipo = false;
    this.limpiarFormularioEquipo();
  }

  cerrarModalTipo(): void {
    this.mostrarModalTipo = false;
    this.limpiarFormularioTipo();
  }

  cerrarModalConfirmar(): void {
    this.mostrarConfirmarEliminar = false;
    this.itemParaEliminar = null;
    this.tipoEliminacion = 'equipo';
  }

  confirmarEliminacion(): void {
    if (!this.itemParaEliminar) return;

    switch (this.tipoEliminacion) {

      case 'equipo': {
        const equipo = this.itemParaEliminar as Equipo;
        const indexEquipo = this.equipos.findIndex(e => e.id === equipo.id);

        if (indexEquipo !== -1) {
          this.equipos.splice(indexEquipo, 1);
          this.filtrarEquipos();
        }

        this.cerrarModalConfirmar();
        alert('Equipo eliminado correctamente');
        break;
      }

      case 'tipo': {
        const tipo = this.itemParaEliminar as TipoEquipo;

        this.tipoEquipoService.eliminar(tipo.id).subscribe({
          next: () => {
            this.cargarTiposEquipo();   // refresca desde backend
            this.cerrarModalConfirmar();
            alert('Tipo eliminado correctamente');
          },
          error: () => {
            alert('Error al eliminar tipo');
          }
        });
        break;
      }
    }
  }

}
