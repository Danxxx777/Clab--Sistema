import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {SedeService} from '../services/sede.service';
import { LaboratorioService } from '../services/laboratorio.service';
import { EncargadoLaboratorioService, EncargadoLaboratorioDTO, UsuarioEncargado } from '../services/encargado-laboratorio.service';
import { Laboratorio, Sede, EncargadoLaboratorio } from '../interfaces/Laboratorio.model';


@Component({
  selector: 'app-laboratorio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './laboratorio.html',
  styleUrls: ['./laboratorio.scss']
})
export class LaboratoriosComponent implements OnInit {

  tabActiva: number = 0;

  laboratorios: Laboratorio[] = [];
  sedes: Sede[] = [];
  encargados: EncargadoLaboratorio[] = [];
  usuariosEncargados: UsuarioEncargado[] = [];
  usuarioSeleccionado: UsuarioEncargado | null = null;

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

  mostrarToast = false;
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';

  mostrarDetalleSede = false;
  sedeDetalle: Sede | null = null;

  mostrarDetalleLab = false;
  labDetalle: Laboratorio | null = null;
  mostrarDetalleEncargado = false;
  encargadoDetalle: EncargadoLaboratorio | null = null;

  constructor(
    private router: Router,
    private sedeService: SedeService,
    private laboratorioService: LaboratorioService,
    private encargadoLaboratorioService: EncargadoLaboratorioService,
    private cdr: ChangeDetectorRef
  ) { }

  drawerAbierto = false;
  rol = localStorage.getItem('rol') || '';
  usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';

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

  cargarSedes(): void {
    this.sedeService.listar().subscribe({
      next: (data) => {
        this.sedes = data;
        this.sedesFiltradas = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando sedes', err)
    });
  }

  cargarLaboratorios(): void {
    this.laboratorioService.listar().subscribe({
      next: (data) => {
        this.laboratorios = data.map(lab => this.mapearLaboratorio(lab));
        this.laboratoriosFiltrados = [...this.laboratorios];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando laboratorios', err)
    });
  }

  cargarEncargados(): void {
    this.encargadoLaboratorioService.listar().subscribe({
      next: (data) => {
        this.encargados = data;
        this.encargadosFiltrados = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando encargados', err)
    });
  }

  cargarUsuariosEncargados(): void {
    this.encargadoLaboratorioService.listarUsuariosEncargados().subscribe({
      next: (data) => this.usuariosEncargados = data,
      error: (err) => console.error('Error cargando usuarios encargados', err)
    });
  }

  onUsuarioChange(): void {
    this.usuarioSeleccionado = this.usuariosEncargados.find(
      u => u.idUsuario === this.formularioEnc.id_usuario
    ) || null;

    if (this.usuarioSeleccionado) {
      this.formularioEnc.identidad = this.usuarioSeleccionado.identidad;
      this.formularioEnc.nombres   = this.usuarioSeleccionado.nombreEncargado;
    }
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
      foto: lab.foto || ''
    };
  }

  ngOnInit(): void {
    this.rol = localStorage.getItem('rol') || '';
    this.usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';
    this.cargarLaboratorios();
    this.cargarSedes();
    this.cargarEncargados();
    this.cargarUsuariosEncargados();
  }

  cambiarTab(index: number): void {
    this.tabActiva = index;
    this.paginaActual = 1;
    if (index === 0 && this.laboratorios.length === 0) this.cargarLaboratorios();
    if (index === 1 && this.sedes.length === 0) this.cargarSedes();
    if (index === 2 && this.encargados.length === 0) this.cargarEncargados();
  }

  getFormularioLabVacio(): Laboratorio {
    return {
      cod_laboratorio: 0, nombre: '', ubicacion: '',
      capacidad_estudiantes: 0, numero_equipos: 0, descripcion: '',
      estado_lab: 'Disponible', id_sede: 0, nombre_sede: '',
      foto: ''
    };
  }

  getFormularioSedeVacio(): Sede {
    return { idSede: 0, nombre: '', direccion: '', telefono: '', email: '', estado: '' };
  }

  getFormularioEncVacio(): EncargadoLaboratorio {
    return {
      idEncargadoLaboratorio: 0,
      id_encargado_laboratorio: 0,
      cod_laboratorio: 0,
      id_usuario: 0,
      fecha_asignacion: new Date().toISOString().split('T')[0],
      vigente: true,
      identidad: '', nombres: '', apellidos: '',
      email: '', telefono: '', nombreLab: ''
    };
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) { alert('Imagen inválida'); return; }
      if (file.size > 5 * 1024 * 1024) { alert('Máx 5MB'); return; }
      const reader = new FileReader();
      reader.onload = (e: any) => { this.formularioLab.foto = e.target.result; };
      reader.readAsDataURL(file);
    }
  }

  eliminarFoto(): void {
    this.formularioLab.foto = '';
    const fi = document.getElementById('fileInput') as HTMLInputElement;
    if (fi) fi.value = '';
  }

  volver(): void { this.router.navigate(['/dashboard']); }

  filtrarLaboratorios(): void {
    const b = this.busquedaLaboratorios.toLowerCase();
    this.laboratoriosFiltrados = this.laboratorios.filter(lab =>
      (lab.cod_laboratorio || 0).toString().includes(b) ||
      (lab.nombre || '').toLowerCase().includes(b) ||
      (lab.ubicacion || '').toLowerCase().includes(b) ||
      (lab.nombre_sede || '').toLowerCase().includes(b)
    );
  }

  filtrarSedes(): void {
    const b = this.busquedaSedes.toLowerCase();
    this.sedesFiltradas = this.sedes.filter(s =>
      s.idSede.toString().includes(b) ||
      s.nombre.toLowerCase().includes(b) ||
      s.direccion.toLowerCase().includes(b) ||
      s.email.toLowerCase().includes(b)
    );
  }

  filtrarEncargados(): void {
    const b = this.busquedaEncargados.toLowerCase();
    this.encargadosFiltrados = this.encargados.filter(enc =>
      (enc.identidad || '').includes(b) ||
      (enc.nombres || '').toLowerCase().includes(b) ||
      (enc.email || '').toLowerCase().includes(b) ||
      (enc.nombreLab || '').toLowerCase().includes(b)
    );
  }

  abrirModal(tipo: 'laboratorio' | 'sede' | 'encargado'): void {
    this.tipoModal = tipo;
    this.mostrarModal = true;
    this.modoEdicion = false;
    this.usuarioSeleccionado = null;
    this.resetFormularios();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.tipoModal = null;
    this.modoEdicion = false;
    this.indiceEdicion = -1;
    this.usuarioSeleccionado = null;
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
      this.mostrarNotificacion('Por favor complete todos los campos obligatorios', 'error');
      return;
    }
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
      this.laboratorioService.editar(this.formularioLab.cod_laboratorio, labData).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarLaboratorios();
          this.mostrarNotificacion('Laboratorio actualizado correctamente');
        },
        error: () => this.mostrarNotificacion('Error al editar el laboratorio', 'error')
      });
    } else {
      this.laboratorioService.crear(labData).subscribe({
        next: (labCreado) => {
          const m = this.mapLabActualizado(labCreado);
          this.laboratorios.push(m);
          this.laboratoriosFiltrados = [...this.laboratorios];
          this.cdr.detectChanges();
          this.cerrarModal();
          this.mostrarNotificacion('Laboratorio creado exitosamente');
        },
        error: () => this.mostrarNotificacion('Error al crear el laboratorio', 'error')
      });
    }
  }

  private mapLabActualizado(lab: any): Laboratorio {
    return {
      cod_laboratorio: lab.codLaboratorio,
      nombre: lab.nombreLab,
      ubicacion: lab.ubicacion,
      capacidad_estudiantes: lab.capacidadEstudiantes,
      numero_equipos: lab.numeroEquipos,
      descripcion: lab.descripcion,
      estado_lab: lab.estadoLab as 'Disponible' | 'Mantenimiento' | 'Bloqueado',
      id_sede: lab.sede?.idSede || 0,
      nombre_sede: lab.sede?.nombre || '',
      foto: this.formularioLab.foto || ''
    };
  }

  eliminarLaboratorio(lab: Laboratorio, index: number): void {
    this.itemParaEliminar = lab;
    this.indiceParaEliminar = index;
    this.tipoModal = 'laboratorio';
    this.mostrarConfirmarEliminar = true;
  }

  validarFormularioLab(): boolean {
    if (this.modoEdicion && !(this.formularioLab.cod_laboratorio || 0 > 0)) return false;
    return !!(
      this.formularioLab.nombre && this.formularioLab.ubicacion &&
      (this.formularioLab.capacidad_estudiantes || 0) > 0 &&
      (this.formularioLab.numero_equipos ?? -1) >= 0 &&
      this.formularioLab.descripcion && this.formularioLab.estado_lab &&
      (this.formularioLab.id_sede || 0) > 0
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
      this.mostrarNotificacion('Por favor complete todos los campos obligatorios', 'error');
      return;
    }
    if (this.modoEdicion && this.formularioSede.idSede) {
      this.sedeService.editar(this.formularioSede.idSede, this.formularioSede).subscribe({
        next: () => { this.cerrarModal(); this.cargarSedes(); this.mostrarNotificacion('Sede actualizada correctamente'); },
        error: () => this.mostrarNotificacion('Error al editar la sede', 'error')
      });
    } else {
      this.sedeService.crear(this.formularioSede).subscribe({
        next: () => { this.cerrarModal(); this.cargarSedes(); this.mostrarNotificacion('Sede creada exitosamente'); },
        error: () => this.mostrarNotificacion('Error al crear la sede', 'error')
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
    return !!(this.formularioSede.nombre && this.formularioSede.direccion &&
      this.formularioSede.telefono && this.formularioSede.email && this.formularioSede.estado);
  }

  editarEncargado(enc: EncargadoLaboratorio, index: number): void {
    this.formularioEnc = {
      ...enc,
      id_encargado_laboratorio: enc.idEncargadoLaboratorio || enc.id_encargado_laboratorio
    };
    this.modoEdicion = true;
    this.indiceEdicion = index;
    this.tipoModal = 'encargado';
    this.mostrarModal = true;
    this.usuarioSeleccionado = this.usuariosEncargados.find(
      u => u.idUsuario === enc.id_usuario
    ) || null;
  }

  guardarEncargado(): void {
    if (!this.validarFormularioEnc()) {
      this.mostrarNotificacion('Por favor complete todos los campos obligatorios', 'error');
      return;
    }
    const dto: EncargadoLaboratorioDTO = {
      laboratorio:     this.formularioEnc.cod_laboratorio,
      usuario:         this.formularioEnc.id_usuario,
      fechaAsignacion: this.formularioEnc.fecha_asignacion as string,
      vigente:         this.formularioEnc.vigente
    };
    if (this.modoEdicion && this.formularioEnc.id_encargado_laboratorio) {
      this.encargadoLaboratorioService.actualizar(this.formularioEnc.id_encargado_laboratorio, dto).subscribe({
        next: () => { this.cerrarModal(); this.cargarEncargados(); this.mostrarNotificacion('✅ Encargado actualizado exitosamente'); },
        error: () => this.mostrarNotificacion('❌ Error al actualizar el encargado', 'error')
      });
    } else {
      this.encargadoLaboratorioService.insertar(dto).subscribe({
        next: () => { this.cerrarModal(); this.cargarEncargados(); this.mostrarNotificacion('✅ Encargado agregado exitosamente'); },
        error: () => this.mostrarNotificacion('❌ Error al agregar el encargado', 'error')
      });
    }
  }

  eliminarEncargado(enc: EncargadoLaboratorio, index: number): void {
    this.itemParaEliminar = enc;
    this.indiceParaEliminar = index;
    this.tipoModal = 'encargado';
    this.mostrarConfirmarEliminar = true;
  }

  validarFormularioEnc(): boolean {
    return !!(
      this.formularioEnc.id_usuario > 0 &&
      this.formularioEnc.cod_laboratorio > 0 &&
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
      this.laboratorioService.eliminar(this.itemParaEliminar.cod_laboratorio).subscribe({
        next: () => {
          this.laboratorios.splice(this.indiceParaEliminar, 1);
          this.filtrarLaboratorios();
          this.cdr.detectChanges();
          this.cerrarModalConfirmar();
          this.mostrarNotificacion('🗑️ Laboratorio eliminado exitosamente');
        },
        error: () => this.mostrarNotificacion('❌ Error al eliminar el laboratorio', 'error')
      });
    } else if (this.tipoModal === 'sede' && this.itemParaEliminar.idSede) {
      this.sedeService.eliminar(this.itemParaEliminar.idSede).subscribe({
        next: () => {
          this.cerrarModalConfirmar();
          this.cargarSedes();
          this.mostrarNotificacion('🗑️ Sede eliminada exitosamente');
        },
        error: () => this.mostrarNotificacion('❌ Error al eliminar la sede', 'error')
      });
    } else if (this.tipoModal === 'encargado') {
      const idEliminar = this.itemParaEliminar.idEncargadoLaboratorio || this.itemParaEliminar.id_encargado_laboratorio;
      if (!idEliminar) return;
      this.encargadoLaboratorioService.eliminar(idEliminar).subscribe({
        next: () => {
          this.cerrarModalConfirmar();
          this.cargarEncargados();
          this.mostrarNotificacion('🗑️ Encargado eliminado exitosamente');
        },
        error: () => this.mostrarNotificacion('❌ Error al eliminar el encargado', 'error')
      });
    }
  }

  verDetalle(item: any): void {
    if (this.tabActiva === 0) {
      this.labDetalle = item;
      this.mostrarDetalleLab = true;
    } else if (this.tabActiva === 1) {
      this.sedeDetalle = item;
      this.mostrarDetalleSede = true;
    } else if (this.tabActiva === 2) {
      this.encargadoDetalle = item;
      this.mostrarDetalleEncargado = true;
    }
  }

  cerrarDetalleLab(): void {
    this.mostrarDetalleLab = false;
    this.labDetalle = null;
  }

  cerrarDetalleEncargado(): void {
    this.mostrarDetalleEncargado = false;
    this.encargadoDetalle = null;
  }

  cerrarDetalleSede(): void {
    this.mostrarDetalleSede = false;
    this.sedeDetalle = null;
  }

  cambiarPagina(pagina: number | string): void {
    if (pagina === 'anterior' && this.paginaActual > 1) this.paginaActual--;
    else if (pagina === 'siguiente') this.paginaActual++;
    else if (typeof pagina === 'number') this.paginaActual = pagina;
  }

  getNombreCompleto(nombres?: string, apellidos?: string): string {
    return `${nombres || ''} ${apellidos || ''}`.trim();
  }

  getEstadoBadgeClass(estado?: string): string {
    if (!estado) return 'inactivo';
    const e = estado.toLowerCase();
    if (e === 'disponible' || e === 'activa' || e === 'activo') return 'activo';
    if (e === 'mantenimiento') return 'mantenimiento';
    return 'inactivo';
  }

  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.mostrarToast = true;
    setTimeout(() => { this.mostrarToast = false; this.cdr.detectChanges(); }, 3000);
  }
}
