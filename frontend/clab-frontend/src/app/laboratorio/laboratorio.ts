import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {SedeService} from '../services/sede.service';



interface Laboratorio {
  cod_laboratorio: number;
  nombre: string;
  ubicacion: string;
  capacidad_estudiantes: number;
  numero_equipos: number;
  descripcion: string;
  estado_lab: 'Disponible' | 'Mantenimiento' | 'Bloqueado';
  id_sede: number;
  nombre_sede?: string;
  encargado_nombre?: string;
  foto?: string; // Nueva propiedad para la URL o base64 de la imagen
}

interface Sede {
  idSede: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  estado: string;
}

interface EncargadoLaboratorio {
  id_encargado_laboratorio: number;
  cod_laboratorio: number;
  id_usuario: number;
  fecha_asignacion: Date | string;
  vigente: boolean;
  identidad?: string;
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  nombre_laboratorio?: string;
}

@Component({
  selector: 'app-laboratorio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './laboratorio.html',
  styleUrls: ['./laboratorio.scss']
})
export class LaboratoriosComponent implements OnInit {

  tabActiva: number = 0;

  laboratorios: Laboratorio[] = [
    {
      cod_laboratorio: 1,
      nombre: 'Laboratorio de Química',
      ubicacion: 'Edificio A, Piso 2',
      capacidad_estudiantes: 30,
      numero_equipos: 15,
      descripcion: 'Laboratorio equipado con material de química básica',
      estado_lab: 'Disponible',
      id_sede: 1,
      nombre_sede: 'Sede Central',
      encargado_nombre: 'Dr. Juan Pérez',
      foto: ''
    },
    {
      cod_laboratorio: 2,
      nombre: 'Laboratorio de Física',
      ubicacion: 'Edificio B, Piso 1',
      capacidad_estudiantes: 25,
      numero_equipos: 12,
      descripcion: 'Laboratorio de física experimental',
      estado_lab: 'Disponible',
      id_sede: 2,
      nombre_sede: 'Sede Norte',
      encargado_nombre: 'Dra. María García',
      foto: ''
    },
    {
      cod_laboratorio: 3,
      nombre: 'Laboratorio de Biología',
      ubicacion: 'Edificio C, Piso 3',
      capacidad_estudiantes: 20,
      numero_equipos: 10,
      descripcion: 'Laboratorio de biología y microbiología',
      estado_lab: 'Mantenimiento',
      id_sede: 3,
      nombre_sede: 'Sede Sur',
      encargado_nombre: 'Dr. Carlos Ruiz',
      foto: ''
    },
    {
      cod_laboratorio: 4,
      nombre: 'Laboratorio de Informática',
      ubicacion: 'Edificio D, Piso 1',
      capacidad_estudiantes: 40,
      numero_equipos: 30,
      descripcion: 'Laboratorio con computadoras de última generación',
      estado_lab: 'Disponible',
      id_sede: 1,
      nombre_sede: 'Sede Central',
      encargado_nombre: 'Ing. Ana Martínez',
      foto: ''
    },
    {
      cod_laboratorio: 5,
      nombre: 'Laboratorio de Electrónica',
      ubicacion: 'Edificio E, Piso 2',
      capacidad_estudiantes: 18,
      numero_equipos: 20,
      descripcion: 'Laboratorio de electrónica y circuitos',
      estado_lab: 'Disponible',
      id_sede: 2,
      nombre_sede: 'Sede Norte',
      encargado_nombre: 'Ing. Roberto Silva',
      foto: ''
    }
  ];

  sedes: Sede[] = [];

  encargados: EncargadoLaboratorio[] = [
    {
      id_encargado_laboratorio: 1,
      cod_laboratorio: 1,
      id_usuario: 5,
      fecha_asignacion: '2024-01-15',
      vigente: true,
      identidad: '0912345678',
      nombres: 'Juan',
      apellidos: 'Pérez',
      email: 'juan.perez@universidad.edu.ec',
      telefono: '(04) 987-6543',
      nombre_laboratorio: 'Laboratorio de Química'
    },
    {
      id_encargado_laboratorio: 2,
      cod_laboratorio: 2,
      id_usuario: 6,
      fecha_asignacion: '2024-02-10',
      vigente: true,
      identidad: '0923456789',
      nombres: 'María',
      apellidos: 'García',
      email: 'maria.garcia@universidad.edu.ec',
      telefono: '(04) 876-5432',
      nombre_laboratorio: 'Laboratorio de Física'
    },
    {
      id_encargado_laboratorio: 3,
      cod_laboratorio: 3,
      id_usuario: 7,
      fecha_asignacion: '2023-11-05',
      vigente: false,
      identidad: '0934567890',
      nombres: 'Carlos',
      apellidos: 'Ruiz',
      email: 'carlos.ruiz@universidad.edu.ec',
      telefono: '(04) 765-4321',
      nombre_laboratorio: 'Laboratorio de Biología'
    },
    {
      id_encargado_laboratorio: 4,
      cod_laboratorio: 4,
      id_usuario: 8,
      fecha_asignacion: '2024-03-01',
      vigente: true,
      identidad: '0945678901',
      nombres: 'Ana',
      apellidos: 'Martínez',
      email: 'ana.martinez@universidad.edu.ec',
      telefono: '(04) 654-3210',
      nombre_laboratorio: 'Laboratorio de Informática'
    }
  ];

  laboratoriosFiltrados: Laboratorio[] = [];
  sedesFiltradas: Sede[] = [];
  encargadosFiltrados: EncargadoLaboratorio[] = [];

  busquedaLaboratorios: string = '';
  busquedaSedes: string = '';
  busquedaEncargados: string = '';

  mostrarModal: boolean = false;
  tipoModal: 'laboratorio' | 'sede' | 'encargado' | null = null;
  modoEdicion: boolean = false;
  indiceEdicion: number = -1;

  formularioLab: Laboratorio = this.getFormularioLabVacio();
  formularioSede: Sede = this.getFormularioSedeVacio();
  formularioEnc: EncargadoLaboratorio = this.getFormularioEncVacio();

  mostrarConfirmarEliminar: boolean = false;
  itemParaEliminar: any = null;
  indiceParaEliminar: number = -1;

  paginaActual: number = 1;

  constructor(private router: Router, private sedeService: SedeService){
  }

  cargarSedes(): void {
    this.sedeService.listar().subscribe({
      next: (data) => {
        this.sedes = data;
        this.sedesFiltradas = [...data];
      },
      error: (err) => {
        console.error('Error cargando sedes', err);
      }
    });
  }

  ngOnInit(): void {
    this.laboratoriosFiltrados = [...this.laboratorios];
    this.sedesFiltradas = [...this.sedes];
    this.encargadosFiltrados = [...this.encargados];
    this.cargarSedes();
  }

  cambiarTab(index: number): void {
    this.tabActiva = index;
    this.paginaActual = 1;

    if (index === 1 && this.sedes.length === 0) {
      this.cargarSedes();
    }
  }

  getFormularioLabVacio(): Laboratorio {
    return {
      cod_laboratorio: 0,
      nombre: '',
      ubicacion: '',
      capacidad_estudiantes: 0,
      numero_equipos: 0,
      descripcion: '',
      estado_lab: 'Disponible',
      id_sede: 0,
      foto: '' // Agregar foto vacía
    };
  }

  getFormularioSedeVacio(): Sede {
    return {
      idSede: 0,
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      estado: ''
    };
  }

  getFormularioEncVacio(): EncargadoLaboratorio {
    return {
      id_encargado_laboratorio: 0,
      cod_laboratorio: 0,
      id_usuario: 0,
      fecha_asignacion: new Date().toISOString().split('T')[0],
      vigente: true,
      identidad: '',
      nombres: '',
      apellidos: '',
      email: '',
      telefono: ''
    };
  }

  // NUEVO: Método para manejar la carga de imagen
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor seleccione un archivo de imagen válido (JPG, PNG, GIF)');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }

      // Convertir a base64
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.formularioLab.foto = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // NUEVO: Método para eliminar la foto
  eliminarFoto(): void {
    this.formularioLab.foto = '';
    // Resetear el input file
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  filtrarLaboratorios(): void {
    const busqueda = this.busquedaLaboratorios.toLowerCase();
    this.laboratoriosFiltrados = this.laboratorios.filter(lab =>
      lab.cod_laboratorio.toString().includes(busqueda) ||
      lab.nombre.toLowerCase().includes(busqueda) ||
      lab.ubicacion.toLowerCase().includes(busqueda) ||
      (lab.nombre_sede && lab.nombre_sede.toLowerCase().includes(busqueda)) ||
      (lab.encargado_nombre && lab.encargado_nombre.toLowerCase().includes(busqueda))
    );
  }

  filtrarSedes(): void {
    const busqueda = this.busquedaSedes.toLowerCase();
    this.sedesFiltradas = this.sedes.filter(sede =>
      sede.idSede.toString().includes(busqueda) ||
      sede.nombre.toLowerCase().includes(busqueda) ||
      sede.direccion.toLowerCase().includes(busqueda) ||
      sede.email.toLowerCase().includes(busqueda)
    );
  }

  filtrarEncargados(): void {
    const busqueda = this.busquedaEncargados.toLowerCase();
    this.encargadosFiltrados = this.encargados.filter(enc =>
      (enc.identidad && enc.identidad.includes(busqueda)) ||
      (enc.nombres && enc.nombres.toLowerCase().includes(busqueda)) ||
      (enc.apellidos && enc.apellidos.toLowerCase().includes(busqueda)) ||
      (enc.email && enc.email.toLowerCase().includes(busqueda)) ||
      (enc.nombre_laboratorio && enc.nombre_laboratorio.toLowerCase().includes(busqueda))
    );
  }

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

  editarLaboratorio(lab: Laboratorio, index: number): void {
    this.formularioLab = { ...lab };
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
      this.laboratorios[this.indiceEdicion] = { ...this.formularioLab };
    } else {
      this.laboratorios.push({ ...this.formularioLab });
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
      this.formularioLab.cod_laboratorio > 0 &&
      this.formularioLab.nombre &&
      this.formularioLab.ubicacion &&
      this.formularioLab.capacidad_estudiantes > 0 &&
      this.formularioLab.numero_equipos >= 0 &&
      this.formularioLab.descripcion &&
      this.formularioLab.estado_lab &&
      this.formularioLab.id_sede > 0
    );
  }

  editarSede(sede: Sede, index: number): void {
    this.formularioSede = { ...sede };
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

    if(this.modoEdicion && this.formularioSede.idSede)
    {
      this.sedeService.editar(this.formularioSede.idSede, this.formularioSede)
        .subscribe({next: (sedeActualizada) => {
            this.sedes[this.indiceEdicion] = <Sede>sedeActualizada;
            this.sedesFiltradas = [...this.sedes];

            this.cerrarModal();
            alert('Sede actualizada exitosamente');
          },
          error: (err) => {
            console.error('Error al editar sede', err);
            alert('Error al editar la sede');
          }
        });
    }
    else
    {
      this.sedeService.crear(this.formularioSede).subscribe({next:
          (sedeCreada) => {
          this.sedes.push(<Sede>sedeCreada);
          this.sedesFiltradas = [...this.sedes];

          this.cerrarModal();
          alert('Sede creada exitosamente');
        },
        error: (err) => {
          console.error('Error al crear sede', err);
          alert('Error al crear la sede');
        }
      });
    }
  }

  eliminarSede(sede: Sede, index: number): void {
    this.itemParaEliminar = sede;
    this.indiceParaEliminar = index;
    this.tipoModal = 'sede';
    this.mostrarConfirmarEliminar = true;
  }

  validarFormularioSede(): boolean {
    return !!(
      this.formularioSede.nombre &&
      this.formularioSede.direccion &&
      this.formularioSede.telefono &&
      this.formularioSede.email &&
      this.formularioSede.estado
    );
  }

  editarEncargado(enc: EncargadoLaboratorio, index: number): void {
    this.formularioEnc = { ...enc };
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
      this.encargados[this.indiceEdicion] = { ...this.formularioEnc };
    } else {
      this.formularioEnc.id_encargado_laboratorio = this.encargados.length + 1;
      this.encargados.push({ ...this.formularioEnc });
    }

    this.filtrarEncargados();
    this.cerrarModal();
    alert(this.modoEdicion ? 'Encargado actualizado exitosamente' : 'Encargado agregado exitosamente');
  }

  eliminarEncargado(enc: EncargadoLaboratorio, index: number): void {
    this.itemParaEliminar = enc;
    this.indiceParaEliminar = index;
    this.tipoModal = 'encargado';
    this.mostrarConfirmarEliminar = true;
  }

  validarFormularioEnc(): boolean {
    return !!(
      this.formularioEnc.cod_laboratorio > 0 &&
      this.formularioEnc.identidad &&
      this.formularioEnc.nombres &&
      this.formularioEnc.apellidos &&
      this.formularioEnc.email &&
      this.formularioEnc.fecha_asignacion
    );
  }

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

  verDetalle(item: any): void {
    console.log('Ver detalle:', item);
  }

  cambiarPagina(pagina: number | string): void {
    if (pagina === 'anterior' && this.paginaActual > 1) {
      this.paginaActual--;
    } else if (pagina === 'siguiente') {
      this.paginaActual++;
    } else if (typeof pagina === 'number') {
      this.paginaActual = pagina;
    }
  }

  getNombreCompleto(nombres?: string, apellidos?: string): string {
    return `${nombres || ''} ${apellidos || ''}`.trim();
  }

  getEstadoBadgeClass(estado: string): string {
    const estadoLower = estado.toLowerCase();
    if (estadoLower === 'disponible' || estadoLower === 'activa' || estadoLower === 'activo') {
      return 'activo';
    }
    if (estadoLower === 'mantenimiento') {
      return 'mantenimiento';
    }
    return 'inactivo';
  }
}
