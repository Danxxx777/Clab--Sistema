import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Interfaces para tipado fuerte
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
  responsable: string;
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

interface Marca {
  id: number;
  nombre: string;
  descripcion: string;
  equipos: number;
}

interface Laboratorio {
  id: number;
  nombre: string;
}

interface Responsable {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrls: ['./inventario.scss']
})
export class InventarioComponent {
  // Variables para pestañas
  tabActiva: 'equipos' | 'tipos' | 'marcas' = 'equipos';
  vista: 'grid' | 'list' = 'grid';
  formTabActiva: 'datos' | 'ubicacion' | 'imagen' = 'datos';

  // Datos de ejemplo para equipos
  equipos: Equipo[] = [
    {
      id: 1,
      nombre: 'Computadora Dell',
      tipoEquipo: 'Computadora',
      marca: 'Dell',
      modelo: 'Optiplex 7090',
      noSerie: 'D1001',
      estado: 'OPERATIVO',
      fechaAdquisicion: '2023-01-15',
      ultimaRevision: '2024-01-10',
      laboratorio: 'Lab Comp A',
      ubicacionFisica: 'Edificio A - Piso 2 - Sala 201',
      responsable: 'Dr. García',
      foto: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400',
      descripcion: 'Computadora de escritorio para laboratorio de cómputo, 16GB RAM, 512GB SSD'
    },
    {
      id: 2,
      nombre: 'Microscopio Leica',
      tipoEquipo: 'Microscopio',
      marca: 'Leica',
      modelo: 'DM2500',
      noSerie: 'LC002',
      estado: 'MANTENIMIENTO',
      fechaAdquisicion: '2022-06-20',
      ultimaRevision: '2024-01-20',
      laboratorio: 'Lab Biología',
      ubicacionFisica: 'Edificio B - Piso 1 - Sala 105',
      responsable: 'Dra. Ruiz',
      foto: 'https://images.unsplash.com/photo-1581093458791-9f3c3250a8e6?w=400',
      descripcion: 'Microscopio profesional para biología con cámara digital integrada'
    },
    {
      id: 3,
      nombre: 'Proyector Epson',
      tipoEquipo: 'Proyector',
      marca: 'Epson',
      modelo: 'PowerLite 1781W',
      noSerie: 'EPS001',
      estado: 'OPERATIVO',
      fechaAdquisicion: '2023-03-10',
      ultimaRevision: '2024-02-15',
      laboratorio: 'Lab Química',
      ubicacionFisica: 'Edificio C - Piso 3 - Auditorio',
      responsable: 'Ing. Martínez',
      foto: 'https://images.unsplash.com/photo-1580982324983-daee9eb0a5b5?w=400',
      descripcion: 'Proyector WXGA 3000 lúmenes para presentaciones'
    }
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

  // Datos para marcas
  marcas: Marca[] = [
    { id: 1, nombre: 'Dell', descripcion: 'Fabricante de computadoras y hardware', equipos: 3 },
    { id: 2, nombre: 'HP', descripcion: 'Hewlett-Packard Company', equipos: 2 },
    { id: 3, nombre: 'Lenovo', descripcion: 'Fabricante de computadoras chino', equipos: 1 },
    { id: 4, nombre: 'Epson', descripcion: 'Fabricante de impresoras y proyectores', equipos: 1 },
    { id: 5, nombre: 'Leica', descripcion: 'Fabricante de microscopios alemana', equipos: 1 }
  ];

  marcasFiltradas: Marca[] = [...this.marcas];
  busquedaMarcas = '';

  // Datos para selects
  laboratorios: Laboratorio[] = [
    { id: 1, nombre: 'Lab Comp A' },
    { id: 2, nombre: 'Lab Comp B' },
    { id: 3, nombre: 'Lab Biología' },
    { id: 4, nombre: 'Lab Química' },
    { id: 5, nombre: 'Lab Física' },
    { id: 6, nombre: 'Lab Electrónica' }
  ];

  responsables: Responsable[] = [
    { id: 1, nombre: 'Dr. García' },
    { id: 2, nombre: 'Dra. Ruiz' },
    { id: 3, nombre: 'Ing. Martínez' },
    { id: 4, nombre: 'Lic. Pérez' },
    { id: 5, nombre: 'Mtro. López' }
  ];

  iconos = ['💻', '🖥️', '💾', '🖨️', '📽️', '🔬', '🔭', '⚗️', '📡', '🔌', '🔋', '⌨️'];

  // Variables modales equipos
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
    responsable: '',
    foto: null,
    descripcion: ''
  };

  // Variables modales tipos
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

  // Variables modales marcas
  mostrarModalMarca = false;
  modoEdicionMarca = false;
  marcaEditandoId: number | null = null;

  formularioMarca: Marca = {
    id: 0,
    nombre: '',
    descripcion: '',
    equipos: 0
  };

  // Variables para detalles
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
    responsable: '',
    foto: null,
    descripcion: ''
  };

  // Variables confirmación eliminar
  mostrarConfirmarEliminar = false;
  itemParaEliminar: Equipo | TipoEquipo | Marca | null = null;
  tipoEliminacion: 'equipo' | 'tipo' | 'marca' = 'equipo';

  constructor(private router: Router) {}

  // Métodos para pestañas
  cambiarTab(tab: 'equipos' | 'tipos' | 'marcas'): void {
    this.tabActiva = tab;
  }

  cambiarVista(vista: 'grid' | 'list'): void {
    this.vista = vista;
  }

  getTextoBoton(): string {
    switch(this.tabActiva) {
      case 'equipos': return 'Equipo';
      case 'tipos': return 'Tipo';
      case 'marcas': return 'Marca';
      default: return '';
    }
  }

  // Métodos de navegación
  agregarNuevo(tab?: string): void {
    switch(this.tabActiva) {
      case 'equipos':
        this.abrirModalEquipo();
        break;
      case 'tipos':
        this.abrirModalTipo();
        break;
      case 'marcas':
        this.abrirModalMarca();
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

  filtrarMarcas(): void {
    const busqueda = this.busquedaMarcas.toLowerCase();
    this.marcasFiltradas = this.marcas.filter(marca =>
      marca.nombre.toLowerCase().includes(busqueda) ||
      (marca.descripcion && marca.descripcion.toLowerCase().includes(busqueda))
    );
  }

  // Métodos para equipos
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
      responsable: equipo.responsable,
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
      responsable: '',
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
      responsable: '',
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
      this.formularioEquipo.responsable,
      this.formularioEquipo.fechaAdquisicion
    ];

    return camposRequeridos.every(campo => campo && campo.toString().trim() !== '');
  }

  // Métodos para tipos de equipo
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

    if (this.modoEdicionTipo && this.tipoEditandoId) {
      const index = this.tiposEquipo.findIndex(t => t.id === this.tipoEditandoId);
      if (index !== -1) {
        this.tiposEquipo[index] = { ...this.formularioTipo };
      }
    } else {
      const nuevoId = Math.max(...this.tiposEquipo.map(t => t.id), 0) + 1;
      this.tiposEquipo.push({
        ...this.formularioTipo,
        id: nuevoId,
        equipos: 0
      });
    }

    this.filtrarTipos();
    this.cerrarModalTipo();
    alert(`Tipo ${this.modoEdicionTipo ? 'actualizado' : 'agregado'} correctamente`);
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

  // Métodos para marcas
  abrirModalMarca(): void {
    this.modoEdicionMarca = false;
    this.marcaEditandoId = null;
    this.limpiarFormularioMarca();
    this.mostrarModalMarca = true;
  }

  editarMarca(marca: Marca): void {
    this.modoEdicionMarca = true;
    this.marcaEditandoId = marca.id;
    this.formularioMarca = { ...marca };
    this.mostrarModalMarca = true;
  }

  eliminarMarca(marca: Marca): void {
    this.itemParaEliminar = marca;
    this.tipoEliminacion = 'marca';
    this.mostrarConfirmarEliminar = true;
  }

  guardarMarca(): void {
    if (!this.formularioMarca.nombre.trim()) {
      alert('El nombre de la marca es requerido');
      return;
    }

    if (this.modoEdicionMarca && this.marcaEditandoId) {
      const index = this.marcas.findIndex(m => m.id === this.marcaEditandoId);
      if (index !== -1) {
        this.marcas[index] = { ...this.formularioMarca };
      }
    } else {
      const nuevoId = Math.max(...this.marcas.map(m => m.id), 0) + 1;
      this.marcas.push({
        ...this.formularioMarca,
        id: nuevoId,
        equipos: 0
      });
    }

    this.filtrarMarcas();
    this.cerrarModalMarca();
    alert(`Marca ${this.modoEdicionMarca ? 'actualizada' : 'agregada'} correctamente`);
  }

  limpiarFormularioMarca(): void {
    this.formularioMarca = {
      id: 0,
      nombre: '',
      descripcion: '',
      equipos: 0
    };
  }

  // Métodos para formulario tabs
  cambiarFormTab(direccion: 'prev' | 'next'): void {
    const tabs: ('datos' | 'ubicacion' | 'imagen')[] = ['datos', 'ubicacion', 'imagen'];
    const currentIndex = tabs.indexOf(this.formTabActiva);

    if (direccion === 'prev' && currentIndex > 0) {
      this.formTabActiva = tabs[currentIndex - 1];
    } else if (direccion === 'next' && currentIndex < tabs.length - 1) {
      this.formTabActiva = tabs[currentIndex + 1];
    }
  }

  // Métodos para archivos
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

  // Métodos para modales
  cerrarModalEquipo(): void {
    this.mostrarModalEquipo = false;
    this.limpiarFormularioEquipo();
  }

  cerrarModalTipo(): void {
    this.mostrarModalTipo = false;
    this.limpiarFormularioTipo();
  }

  cerrarModalMarca(): void {
    this.mostrarModalMarca = false;
    this.limpiarFormularioMarca();
  }

  cerrarModalConfirmar(): void {
    this.mostrarConfirmarEliminar = false;
    this.itemParaEliminar = null;
    this.tipoEliminacion = 'equipo';
  }

  confirmarEliminacion(): void {
    if (!this.itemParaEliminar) return;

    switch(this.tipoEliminacion) {
      case 'equipo':
        const equipo = this.itemParaEliminar as Equipo;
        const indexEquipo = this.equipos.findIndex(e => e.id === equipo.id);
        if (indexEquipo !== -1) {
          this.equipos.splice(indexEquipo, 1);
          this.filtrarEquipos();
        }
        break;
      case 'tipo':
        const tipo = this.itemParaEliminar as TipoEquipo;
        const indexTipo = this.tiposEquipo.findIndex(t => t.id === tipo.id);
        if (indexTipo !== -1) {
          this.tiposEquipo.splice(indexTipo, 1);
          this.filtrarTipos();
        }
        break;
      case 'marca':
        const marca = this.itemParaEliminar as Marca;
        const indexMarca = this.marcas.findIndex(m => m.id === marca.id);
        if (indexMarca !== -1) {
          this.marcas.splice(indexMarca, 1);
          this.filtrarMarcas();
        }
        break;
    }

    this.cerrarModalConfirmar();
    alert(`${this.tipoEliminacion} eliminado correctamente`);
  }
}
