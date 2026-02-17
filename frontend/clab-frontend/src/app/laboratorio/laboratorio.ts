import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {SedeService} from '../services/sede.service';
import { LaboratorioService } from '../services/laboratorio.service';


interface Laboratorio {
  codLaboratorio?: number;  // Ahora camelCase
  cod_laboratorio?: number; // Mantener para compatibilidad
  nombreLab?: string;       // Nuevo nombre
  nombre?: string;          // Mantener para compatibilidad
  ubicacion: string;
  capacidadEstudiantes?: number;
  capacidad_estudiantes?: number; // Mantener para compatibilidad
  numeroEquipos?: number;
  numero_equipos?: number;  // Mantener para compatibilidad
  descripcion: string;
  estadoLab?: string;
  estado_lab?: 'Disponible' | 'Mantenimiento' | 'Bloqueado';
  idSede?: number;
  id_sede?: number;         // Mantener para compatibilidad
  sede?: {
    idSede: number;
    nombre: string;
  };
  nombreSede?: string;
  nombre_sede?: string;
  encargadoNombre?: string;
  encargado_nombre?: string;
  foto?: string;
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

  constructor(
    private router: Router,
    private sedeService: SedeService,
    private laboratorioService: LaboratorioService,
    private cdr: ChangeDetectorRef// ← AGREGAR
  ) { }

  cargarSedes(): void {
    this.sedeService.listar().subscribe({
      next: (data) => {
        this.sedes = data;
        this.sedesFiltradas = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando sedes', err);
      }
    });
  }

  cargarLaboratorios(): void {
    this.laboratorioService.listar().subscribe({
      next: (data) => {
        this.laboratorios = data.map(lab => this.mapearLaboratorio(lab));
        this.laboratoriosFiltrados = [...this.laboratorios];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando laboratorios', err);
      }
    });
  }

  private mapearLaboratorio(lab: any): Laboratorio {
    return {
      cod_laboratorio: lab.codLaboratorio || lab.cod_laboratorio || 0,
      nombre: lab.nombreLab || lab.nombre || '',
      ubicacion: lab.ubicacion || '',
      capacidad_estudiantes: lab.capacidadEstudiantes || lab.capacidad_estudiantes || 0,
      numero_equipos: lab.numeroEquipos || lab.numero_equipos || 0,
      descripcion: lab.descripcion || '',
      estado_lab: lab.estadoLab || lab.estado_lab || 'Disponible',
      id_sede: lab.sede?.idSede || lab.idSede || lab.id_sede || 0,
      nombre_sede: lab.sede?.nombre || lab.nombreSede || lab.nombre_sede || '',
      encargado_nombre: lab.encargadoNombre || lab.encargado_nombre || '',
      foto: lab.foto || ''
    };
  }

  ngOnInit(): void {
    this.cargarLaboratorios();  // ← AGREGAR
    this.cargarSedes();
    this.encargadosFiltrados = [...this.encargados];
  }

  cambiarTab(index: number): void {
    this.tabActiva = index;
    this.paginaActual = 1;

    if (index === 0 && this.laboratorios.length === 0) {
      this.cargarLaboratorios();  // ← AGREGAR
    }

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
      nombre_sede: '',
      encargado_nombre: '',
      foto: ''
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
    this.laboratoriosFiltrados = this.laboratorios.filter(lab => {
      const codigo = (lab.cod_laboratorio || lab.codLaboratorio || 0).toString();
      const nombre = (lab.nombre || lab.nombreLab || '').toLowerCase();
      const ubicacion = (lab.ubicacion || '').toLowerCase();
      const nombreSede = (lab.nombre_sede || lab.nombreSede || '').toLowerCase();
      const encargado = (lab.encargado_nombre || lab.encargadoNombre || '').toLowerCase();

      return codigo.includes(busqueda) ||
        nombre.includes(busqueda) ||
        ubicacion.includes(busqueda) ||
        nombreSede.includes(busqueda) ||
        encargado.includes(busqueda);
    });
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

    // Preparar datos para enviar al backend
    const labData = {
      ...(this.modoEdicion && { codLaboratorio: this.formularioLab.cod_laboratorio }),
      nombreLab: this.formularioLab.nombre,
      ubicacion: this.formularioLab.ubicacion,
      capacidadEstudiantes: this.formularioLab.capacidad_estudiantes,
      numeroEquipos: this.formularioLab.numero_equipos,
      descripcion: this.formularioLab.descripcion,
      estadoLab: this.formularioLab.estado_lab,
      idSede: this.formularioLab.id_sede,
      foto: this.formularioLab.foto
    };

    if (this.modoEdicion && this.formularioLab.cod_laboratorio) {
      // EDITAR LABORATORIO
      this.laboratorioService.editar(this.formularioLab.cod_laboratorio, labData)
        .subscribe({
          next: (labActualizado) => {
            // Mapear respuesta del backend
            const labMapeado = {
              cod_laboratorio: labActualizado.codLaboratorio,
              nombre: labActualizado.nombreLab,
              ubicacion: labActualizado.ubicacion,
              capacidad_estudiantes: labActualizado.capacidadEstudiantes,
              numero_equipos: labActualizado.numeroEquipos,
              descripcion: labActualizado.descripcion,
              estado_lab: labActualizado.estadoLab as 'Disponible' | 'Mantenimiento' | 'Bloqueado',
              id_sede: labActualizado.sede?.idSede || 0,
              nombre_sede: labActualizado.sede?.nombre || '',
              foto: this.formularioLab.foto || ''
            };

            this.laboratorios[this.indiceEdicion] = labMapeado;
            this.laboratoriosFiltrados = [...this.laboratorios];
            this.cdr.detectChanges();
            this.cerrarModal();
            alert('Laboratorio actualizado correctamente');
          },
          error: (err) => {
            console.error('Error al editar laboratorio', err);
            alert('Error al editar el laboratorio');
          }
        });
    } else {
      // CREAR LABORATORIO
      this.laboratorioService.crear(labData).subscribe({
        next: (labCreado) => {
          // Mapear respuesta del backend
          const labMapeado = {
            cod_laboratorio: labCreado.codLaboratorio,
            nombre: labCreado.nombreLab,
            ubicacion: labCreado.ubicacion,
            capacidad_estudiantes: labCreado.capacidadEstudiantes,
            numero_equipos: labCreado.numeroEquipos,
            descripcion: labCreado.descripcion,
            estado_lab: labCreado.estadoLab as 'Disponible' | 'Mantenimiento' | 'Bloqueado',
            id_sede: labCreado.sede?.idSede || 0,
            nombre_sede: labCreado.sede?.nombre || '',
            foto: this.formularioLab.foto || ''
          };

          this.laboratorios.push(labMapeado);
          this.laboratoriosFiltrados = [...this.laboratorios];
          this.cdr.detectChanges();
          this.cerrarModal();
          alert('Laboratorio creado exitosamente');
        },
        error: (err) => {
          console.error('Error al crear laboratorio', err);
          alert('Error al crear el laboratorio');
        }
      });
    }
  }

  eliminarLaboratorio(lab: Laboratorio, index: number): void {
    this.itemParaEliminar = lab;
    this.indiceParaEliminar = index;
    this.tipoModal = 'laboratorio';
    this.mostrarConfirmarEliminar = true;
  }

  validarFormularioLab(): boolean {
    const nombre = this.formularioLab.nombre || '';
    const capacidad = this.formularioLab.capacidad_estudiantes || 0;
    const equipos = this.formularioLab.numero_equipos ?? -1;
    const estado = this.formularioLab.estado_lab || '';
    const sede = this.formularioLab.id_sede || 0;

    if (this.modoEdicion) {
      const codigo = this.formularioLab.cod_laboratorio || 0;
      if (codigo <= 0) return false;
    }

    return !!(
      nombre &&
      this.formularioLab.ubicacion &&
      capacidad > 0 &&
      equipos >= 0 &&
      this.formularioLab.descripcion &&
      estado &&
      sede > 0
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
            this.cdr.detectChanges();


            this.cerrarModal();
            alert('Sede actualizada correctamente');
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
          this.cdr.detectChanges();

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
    if (this.tipoModal === 'laboratorio' && this.itemParaEliminar.cod_laboratorio) {
      // ELIMINAR LABORATORIO
      this.laboratorioService.eliminar(this.itemParaEliminar.cod_laboratorio).subscribe({
        next: () => {
          this.laboratorios.splice(this.indiceParaEliminar, 1);
          this.filtrarLaboratorios();
          this.cdr.detectChanges();
          this.cerrarModalConfirmar();
          alert('Laboratorio eliminado exitosamente');
        },
        error: (err) => {
          console.error('Error al eliminar laboratorio', err);
          alert('Error al eliminar el laboratorio');
        }
      });
    } else if (this.tipoModal === 'sede' && this.itemParaEliminar.idSede) {
      // ELIMINAR SEDE (necesitas agregar este método en SedeService)
      this.sedeService.eliminar(this.itemParaEliminar.idSede).subscribe({
        next: () => {
          this.sedes.splice(this.indiceParaEliminar, 1);
          this.filtrarSedes();
          this.cdr.detectChanges();
          this.cerrarModalConfirmar();
          alert('Sede eliminada exitosamente');
        },
        error: (err) => {
          console.error('Error al eliminar sede', err);
          alert('Error al eliminar la sede');
        }
      });
    } else if (this.tipoModal === 'encargado') {
      this.encargados.splice(this.indiceParaEliminar, 1);
      this.filtrarEncargados();
      this.cdr.detectChanges();
      this.cerrarModalConfirmar();
      alert('Encargado eliminado exitosamente');
    }
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

  getEstadoBadgeClass(estado?: string): string {
    if (!estado) return 'inactivo';  // Manejo de undefined/null

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
