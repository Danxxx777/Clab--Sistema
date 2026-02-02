import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';


interface Laboratorio {
  codigo: string;
  nombre: string;
  sede: string;
  capacidad: number;
  encargado: string;
  estado: string;
}

interface Sede {
  codigo: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  estado: string;
}

interface Encargado {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  laboratorioAsignado: string;
  estado: string;
}

@Component({
  selector: 'app-laboratorio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './laboratorio.html',
  styleUrls: ['./laboratorio.scss']
})
export class LaboratoriosComponent implements OnInit {
  // Control de tabs
  tabActiva: number = 0;

  // Arrays de datos
  laboratorios: Laboratorio[] = [
    {
      codigo: 'LAB-001',
      nombre: 'Laboratorio de Química',
      sede: 'Sede Central',
      capacidad: 30,
      encargado: 'Dr. Juan Pérez',
      estado: 'Activo'
    },
    {
      codigo: 'LAB-002',
      nombre: 'Laboratorio de Física',
      sede: 'Sede Norte',
      capacidad: 25,
      encargado: 'Dra. María García',
      estado: 'Activo'
    },
    {
      codigo: 'LAB-003',
      nombre: 'Laboratorio de Biología',
      sede: 'Sede Sur',
      capacidad: 20,
      encargado: 'Dr. Carlos Ruiz',
      estado: 'Inactivo'
    },
    {
      codigo: 'LAB-004',
      nombre: 'Laboratorio de Informática',
      sede: 'Sede Central',
      capacidad: 40,
      encargado: 'Ing. Ana Martínez',
      estado: 'Activo'
    },
    {
      codigo: 'LAB-005',
      nombre: 'Laboratorio de Electrónica',
      sede: 'Sede Norte',
      capacidad: 18,
      encargado: 'Ing. Roberto Silva',
      estado: 'Activo'
    }
  ];

  sedes: Sede[] = [
    {
      codigo: 'SED-001',
      nombre: 'Sede Central',
      direccion: 'Av. Principal 123',
      ciudad: 'Guayaquil',
      telefono: '(04) 234-5678',
      estado: 'Activa'
    },
    {
      codigo: 'SED-002',
      nombre: 'Sede Norte',
      direccion: 'Calle Norte 456',
      ciudad: 'Guayaquil',
      telefono: '(04) 345-6789',
      estado: 'Activa'
    },
    {
      codigo: 'SED-003',
      nombre: 'Sede Sur',
      direccion: 'Av. Sur 789',
      ciudad: 'Guayaquil',
      telefono: '(04) 456-7890',
      estado: 'Activa'
    }
  ];

  encargados: Encargado[] = [
    {
      id: 'ENC-001',
      nombre: 'Dr. Juan Pérez',
      email: 'juan.perez@email.com',
      telefono: '(04) 987-6543',
      laboratorioAsignado: 'Lab. Química',
      estado: 'Activo'
    },
    {
      id: 'ENC-002',
      nombre: 'Dra. María García',
      email: 'maria.garcia@email.com',
      telefono: '(04) 876-5432',
      laboratorioAsignado: 'Lab. Física',
      estado: 'Activo'
    },
    {
      id: 'ENC-003',
      nombre: 'Dr. Carlos Ruiz',
      email: 'carlos.ruiz@email.com',
      telefono: '(04) 765-4321',
      laboratorioAsignado: 'Lab. Biología',
      estado: 'Inactivo'
    },
    {
      id: 'ENC-004',
      nombre: 'Ing. Ana Martínez',
      email: 'ana.martinez@email.com',
      telefono: '(04) 654-3210',
      laboratorioAsignado: 'Lab. Informática',
      estado: 'Activo'
    }
  ];

  // Arrays filtrados
  laboratoriosFiltrados: Laboratorio[] = [];
  sedesFiltradas: Sede[] = [];
  encargadosFiltrados: Encargado[] = [];

  // Búsquedas
  busquedaLaboratorios: string = '';
  busquedaSedes: string = '';
  busquedaEncargados: string = '';

  // Modales
  mostrarModal: boolean = false;
  tipoModal: 'laboratorio' | 'sede' | 'encargado' | null = null;
  modoEdicion: boolean = false;
  indiceEdicion: number = -1;

  // Formularios
  formularioLab: Laboratorio = this.getFormularioLabVacio();
  formularioSede: Sede = this.getFormularioSedeVacio();
  formularioEnc: Encargado = this.getFormularioEncVacio();

  // Modal de confirmación
  mostrarConfirmarEliminar: boolean = false;
  itemParaEliminar: any = null;
  indiceParaEliminar: number = -1;

  // Paginación
  paginaActual: number = 1;

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    this.laboratoriosFiltrados = [...this.laboratorios];
    this.sedesFiltradas = [...this.sedes];
    this.encargadosFiltrados = [...this.encargados];
  }

  // Métodos auxiliares para formularios vacíos
  getFormularioLabVacio(): Laboratorio {
    return {
      codigo: '',
      nombre: '',
      sede: '',
      capacidad: 0,
      encargado: '',
      estado: ''
    };
  }

  getFormularioSedeVacio(): Sede {
    return {
      codigo: '',
      nombre: '',
      direccion: '',
      ciudad: '',
      telefono: '',
      estado: ''
    };
  }

  getFormularioEncVacio(): Encargado {
    return {
      id: '',
      nombre: '',
      email: '',
      telefono: '',
      laboratorioAsignado: '',
      estado: ''
    };
  }

  // Navegación
  volver() {
    this.router.navigate(['/dashboard']);
  }

  cambiarTab(index: number): void {
    this.tabActiva = index;
    this.paginaActual = 1;
  }

  // Filtros
  filtrarLaboratorios(): void {
    const busqueda = this.busquedaLaboratorios.toLowerCase();
    this.laboratoriosFiltrados = this.laboratorios.filter(lab =>
      lab.codigo.toLowerCase().includes(busqueda) ||
      lab.nombre.toLowerCase().includes(busqueda) ||
      lab.sede.toLowerCase().includes(busqueda) ||
      lab.encargado.toLowerCase().includes(busqueda)
    );
  }

  filtrarSedes(): void {
    const busqueda = this.busquedaSedes.toLowerCase();
    this.sedesFiltradas = this.sedes.filter(sede =>
      sede.codigo.toLowerCase().includes(busqueda) ||
      sede.nombre.toLowerCase().includes(busqueda) ||
      sede.direccion.toLowerCase().includes(busqueda) ||
      sede.ciudad.toLowerCase().includes(busqueda)
    );
  }

  filtrarEncargados(): void {
    const busqueda = this.busquedaEncargados.toLowerCase();
    this.encargadosFiltrados = this.encargados.filter(enc =>
      enc.id.toLowerCase().includes(busqueda) ||
      enc.nombre.toLowerCase().includes(busqueda) ||
      enc.email.toLowerCase().includes(busqueda) ||
      enc.laboratorioAsignado.toLowerCase().includes(busqueda)
    );
  }

  // Modales
  abrirModal(tipo: 'laboratorio' | 'sede' | 'encargado'): void {
    this.tipoModal = tipo;
    this.mostrarModal = true;
    this.modoEdicion = false;
    this.resetFormularios();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.tipoModal = null;
    this.modoEdicion = false;
    this.indiceEdicion = -1;
    this.resetFormularios();
  }

  resetFormularios(): void {
    this.formularioLab = this.getFormularioLabVacio();
    this.formularioSede = this.getFormularioSedeVacio();
    this.formularioEnc = this.getFormularioEncVacio();
  }

  // CRUD Laboratorios
  editarLaboratorio(lab: Laboratorio, index: number): void {
    this.formularioLab = {...lab};
    this.modoEdicion = true;
    this.indiceEdicion = index;
    this.tipoModal = 'laboratorio';
    this.mostrarModal = true;
  }

  guardarLaboratorio(): void {
    if (!this.validarFormularioLab()) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    if (this.modoEdicion) {
      this.laboratorios[this.indiceEdicion] = {...this.formularioLab};
    } else {
      this.laboratorios.push({...this.formularioLab});
    }

    this.filtrarLaboratorios();
    this.cerrarModal();
    alert(this.modoEdicion ? 'Laboratorio actualizado exitosamente' : 'Laboratorio agregado exitosamente');
  }

  eliminarLaboratorio(lab: Laboratorio, index: number): void {
    this.itemParaEliminar = lab;
    this.indiceParaEliminar = index;
    this.tipoModal = 'laboratorio';
    this.mostrarConfirmarEliminar = true;
  }

  validarFormularioLab(): boolean {
    return !!(
      this.formularioLab.codigo &&
      this.formularioLab.nombre &&
      this.formularioLab.sede &&
      this.formularioLab.capacidad > 0 &&
      this.formularioLab.encargado &&
      this.formularioLab.estado
    );
  }

  // CRUD Sedes
  editarSede(sede: Sede, index: number): void {
    this.formularioSede = {...sede};
    this.modoEdicion = true;
    this.indiceEdicion = index;
    this.tipoModal = 'sede';
    this.mostrarModal = true;
  }

  guardarSede(): void {
    if (!this.validarFormularioSede()) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    if (this.modoEdicion) {
      this.sedes[this.indiceEdicion] = {...this.formularioSede};
    } else {
      this.sedes.push({...this.formularioSede});
    }

    this.filtrarSedes();
    this.cerrarModal();
    alert(this.modoEdicion ? 'Sede actualizada exitosamente' : 'Sede agregada exitosamente');
  }

  eliminarSede(sede: Sede, index: number): void {
    this.itemParaEliminar = sede;
    this.indiceParaEliminar = index;
    this.tipoModal = 'sede';
    this.mostrarConfirmarEliminar = true;
  }

  validarFormularioSede(): boolean {
    return !!(
      this.formularioSede.codigo &&
      this.formularioSede.nombre &&
      this.formularioSede.direccion &&
      this.formularioSede.ciudad &&
      this.formularioSede.telefono &&
      this.formularioSede.estado
    );
  }

  // CRUD Encargados
  editarEncargado(enc: Encargado, index: number): void {
    this.formularioEnc = {...enc};
    this.modoEdicion = true;
    this.indiceEdicion = index;
    this.tipoModal = 'encargado';
    this.mostrarModal = true;
  }

  guardarEncargado(): void {
    if (!this.validarFormularioEnc()) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    if (this.modoEdicion) {
      this.encargados[this.indiceEdicion] = {...this.formularioEnc};
    } else {
      this.encargados.push({...this.formularioEnc});
    }

    this.filtrarEncargados();
    this.cerrarModal();
    alert(this.modoEdicion ? 'Encargado actualizado exitosamente' : 'Encargado agregado exitosamente');
  }

  eliminarEncargado(enc: Encargado, index: number): void {
    this.itemParaEliminar = enc;
    this.indiceParaEliminar = index;
    this.tipoModal = 'encargado';
    this.mostrarConfirmarEliminar = true;
  }

  validarFormularioEnc(): boolean {
    return !!(
      this.formularioEnc.id &&
      this.formularioEnc.nombre &&
      this.formularioEnc.email &&
      this.formularioEnc.telefono &&
      this.formularioEnc.laboratorioAsignado &&
      this.formularioEnc.estado
    );
  }

  // Confirmación de eliminación
  cerrarModalConfirmar(): void {
    this.mostrarConfirmarEliminar = false;
    this.itemParaEliminar = null;
    this.indiceParaEliminar = -1;
  }

  confirmarEliminacion(): void {
    if (this.tipoModal === 'laboratorio') {
      this.laboratorios.splice(this.indiceParaEliminar, 1);
      this.filtrarLaboratorios();
    } else if (this.tipoModal === 'sede') {
      this.sedes.splice(this.indiceParaEliminar, 1);
      this.filtrarSedes();
    } else if (this.tipoModal === 'encargado') {
      this.encargados.splice(this.indiceParaEliminar, 1);
      this.filtrarEncargados();
    }

    this.cerrarModalConfirmar();
    alert('Elemento eliminado exitosamente');
  }

  // Ver detalle
  verDetalle(item: any): void {
    console.log('Ver detalle:', item);
    // Implementar lógica para ver detalles
  }

  // Paginación
  cambiarPagina(pagina: number | string): void {
    if (pagina === 'anterior' && this.paginaActual > 1) {
      this.paginaActual--;
    } else if (pagina === 'siguiente') {
      this.paginaActual++;
    } else if (typeof pagina === 'number') {
      this.paginaActual = pagina;
    }
  }
}
