import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TipoReservaService } from '../services/tipo-reserva.service';
import { ChangeDetectorRef } from '@angular/core';
/* =========================
   INTERFACES
========================= */

interface Reserva {
  id_reserva: number;
  cod_laboratorio: number;
  nombre_laboratorio: string;
  fecha_reserva: string;
  fecha_solicitud: string;
  hora_inicio: string;
  hora_fin: string;
  id_asignatura: number;
  nombre_asignatura: string;
  id_periodo: number;
  nombre_periodo: string;
  numero_estudiantes: number;
  id_tipo_reserva: number;
  nombre_tipo: string;
  id_usuario: number;
  estado: 'Pendiente' | 'Aprobada' | 'Cancelada' | 'Completada';
  descripcion: string;
  motivo: string;
}

interface Cancelacion {
  id_reserva: number;
  id_usuario_cancela: number;
  fecha_cancelacion: string;
  motivo_cancelacion: string;
}

interface TipoReserva {
  id_tipo_reserva: number;
  nombre_tipo: string;
  descripcion: string;
  estado: 'Activo' | 'Inactivo';
}

interface Laboratorio {
  cod_laboratorio: number;
  nombre: string;
}

interface Asignatura {
  id_asignatura: number;
  nombre: string;
}

interface Periodo {
  id_periodo: number;
  nombre_periodo: string;
}

interface HorarioAcademico {
  id_horario_academico: number;
  nombre_asignatura: string;
  dia_semana: string;
}

interface Usuario {
  id_usuario: number;
  nombres: string;
  apellidos: string;
}

/* =========================
   COMPONENTE
========================= */

@Component({
  selector: 'app-reservar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservar.html',
  styleUrls: ['./reservar.scss']
})
export class ReservarComponent implements OnInit {

  constructor(
    private router: Router,
    private tipoReservaService: TipoReservaService,
    private cdr: ChangeDetectorRef
  ) {}

  /* =========================
     TABS
  ========================= */
  tabActiva = 0;

  cambiarTab(tab: number) {
    this.tabActiva = tab;
  }

  /* =========================
     LISTAS PRINCIPALES
  ========================= */

  reservas: Reserva[] = [];
  reservasFiltradas: Reserva[] = [];

  tipos: TipoReserva[] = [];
  tiposFiltrados: TipoReserva[] = [];

  /* =========================
     LISTAS SELECTS
  ========================= */

  laboratorios: Laboratorio[] = [];
  asignaturas: Asignatura[] = [];
  periodos: Periodo[] = [];
  horariosAcademicos: HorarioAcademico[] = [];
  usuarios: Usuario[] = [];

  /* =========================
     BUSQUEDAS
  ========================= */

  busquedaReservas = '';
  busquedaTipos = '';

  filtrarReservas() {
    const texto = this.busquedaReservas.toLowerCase();
    this.reservasFiltradas = this.reservas.filter(r =>
      r.nombre_laboratorio.toLowerCase().includes(texto) ||
      r.nombre_asignatura.toLowerCase().includes(texto) ||
      r.nombre_periodo.toLowerCase().includes(texto)
    );
  }

  filtrarTipos() {
    const texto = this.busquedaTipos.toLowerCase();
    this.tiposFiltrados = this.tipos.filter(t =>
      t.nombre_tipo.toLowerCase().includes(texto)
    );
  }

  /* =========================
     MODALES - RESERVA / TIPO
  ========================= */

  mostrarModal = false;
  mostrarConfirmarEliminar = false;
  tipoModal: 'reserva' | 'tipo' | null = null;
  modoEdicion = false;

  itemSeleccionado: any = null;
  indexSeleccionado: number | null = null;


  mostrarToast = false;
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';

  abrirModal(tipo: 'reserva' | 'tipo') {
    this.tipoModal = tipo;
    this.modoEdicion = false;
    this.mostrarModal = true;
    this.resetFormularios();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.tipoModal = null;
  }

  cerrarModalConfirmar() {
    this.mostrarConfirmarEliminar = false;
  }

  /* =========================
     MODAL - CANCELAR RESERVA
  ========================= */

  mostrarModalCancelar = false;

  formularioCancelacion: Cancelacion = {
    id_reserva: 0,
    id_usuario_cancela: 0,
    fecha_cancelacion: '',
    motivo_cancelacion: ''
  };

  abrirModalCancelar(res: Reserva, index: number) {
    this.itemSeleccionado = res;
    this.indexSeleccionado = index;
    this.formularioCancelacion = {
      id_reserva: res.id_reserva,
      id_usuario_cancela: 0,
      fecha_cancelacion: new Date().toISOString().split('T')[0],
      motivo_cancelacion: ''
    };
    this.mostrarModalCancelar = true;
  }

  cerrarModalCancelar() {
    this.mostrarModalCancelar = false;
    this.itemSeleccionado = null;
    this.indexSeleccionado = null;
  }

  confirmarCancelacion() {
    if (this.indexSeleccionado === null) return;

    // Aquí irá la llamada al servicio con el procedimiento almacenado
    // this.reservaService.cancelarReserva(this.formularioCancelacion).subscribe(...)

    // Por ahora actualizamos el estado localmente
    this.reservas[this.indexSeleccionado].estado = 'Cancelada';
    this.reservasFiltradas = [...this.reservas];

    this.cerrarModalCancelar();
  }

  /* =========================
     FORMULARIOS
  ========================= */

  formularioReserva: any = {};
  formularioTipo: any = {};

  resetFormularios() {
    this.formularioReserva = {
      cod_laboratorio: 0,
      id_asignatura: 0,
      id_periodo: 0,
      id_horario_academico: null,
      fecha_reserva: '',
      fecha_solicitud: '',
      hora_inicio: '',
      hora_fin: '',
      numero_estudiantes: 1,
      id_tipo_reserva: 0,
      id_usuario: 0,
      descripcion: '',
      motivo: '',
      estado: 'Pendiente'
    };

    this.formularioTipo = {
      nombre_tipo: '',
      descripcion: '',
      estado: 'Activo'
    };
  }

  /* =========================
     CRUD RESERVAS
  ========================= */

  guardarReserva() {

    if (this.modoEdicion && this.indexSeleccionado !== null) {

      this.reservas[this.indexSeleccionado] = {
        ...this.reservas[this.indexSeleccionado],
        ...this.formularioReserva
      };

    } else {

      const nuevaReserva: Reserva = {
        id_reserva: Date.now(),
        nombre_laboratorio: 'Laboratorio Demo',
        nombre_asignatura: 'Asignatura Demo',
        nombre_periodo: '2025-A',
        nombre_tipo: 'Clase Regular',
        ...this.formularioReserva
      };

      this.reservas.push(nuevaReserva);
    }

    this.reservasFiltradas = [...this.reservas];
    this.cerrarModal();
  }

  editarReserva(res: Reserva, index: number) {
    this.modoEdicion = true;
    this.tipoModal = 'reserva';
    this.mostrarModal = true;
    this.indexSeleccionado = index;
    this.formularioReserva = { ...res };
  }

  /* =========================
     CRUD TIPOS
  ========================= */

  guardarTipo() {
    if (!this.formularioTipo.nombre_tipo?.trim()) {
      this.mostrarNotificacion('El nombre del tipo es obligatorio', 'error');
      return;
    }

    const dto = {
      nombreTipo: this.formularioTipo.nombre_tipo,
      descripcion: this.formularioTipo.descripcion || ''
    };

    if (this.modoEdicion && this.indexSeleccionado !== null) {
      const id = this.tipos[this.indexSeleccionado].id_tipo_reserva;
      this.tipoReservaService.actualizar(id, dto).subscribe({
        next: () => {
          this.cargarTipos();
          this.cerrarModal();
          this.mostrarNotificacion('✅ Tipo de reserva actualizado correctamente');
        },
        error: (err) => {
          console.error('Error actualizando tipo:', err);
          this.mostrarNotificacion('❌ Error al actualizar el tipo', 'error');
        }
      });
    } else {
      this.tipoReservaService.crear(dto).subscribe({
        next: () => {
          this.cargarTipos();
          this.cerrarModal();
          this.mostrarNotificacion('✅ Tipo de reserva creado exitosamente');
        },
        error: (err) => {
          console.error('Error creando tipo:', err);
          this.mostrarNotificacion('❌ Error al crear el tipo', 'error');
        }
      });
    }
  }

  editarTipo(tipo: TipoReserva, index: number) {
    this.modoEdicion = true;
    this.tipoModal = 'tipo';
    this.mostrarModal = true;
    this.indexSeleccionado = index;
    this.formularioTipo = { ...tipo };
  }

  eliminarTipo(tipo: TipoReserva, index: number) {
    this.itemSeleccionado = tipo;
    this.indexSeleccionado = index;
    this.mostrarConfirmarEliminar = true;
  }

  confirmarEliminacion() {
    if (this.indexSeleccionado !== null) {
      const id = this.tipos[this.indexSeleccionado].id_tipo_reserva;

      this.tipoReservaService.eliminar(id).subscribe({
        next: () => {
          this.cargarTipos();
          this.cerrarModalConfirmar();
          this.mostrarNotificacion('🗑️ Tipo de reserva eliminado exitosamente');
        },
        error: (err) => {
          console.error('Error eliminando tipo:', err);
          this.mostrarNotificacion('❌ Error al eliminar el tipo', 'error');
        }
      });
    }
  }

  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.mostrarToast = true;

    setTimeout(() => {
      this.mostrarToast = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  getItemNombre(): string {
    if (!this.itemSeleccionado) return '';
    return this.itemSeleccionado.nombre_tipo || '';
  }

  getEstadoBadgeClass(estado: string): string {
    return estado.toLowerCase();
  }

  verDetalle(res: Reserva) {
    console.log('Detalle:', res);
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }

  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.cargarTipos();

    this.laboratorios = [];
    this.asignaturas = [];
    this.periodos = [];
    this.horariosAcademicos = [];
    this.usuarios = [];

    this.reservasFiltradas = [...this.reservas];
  }

  cargarTipos(): void {
    this.tipoReservaService.listar().subscribe({
      next: (data) => {
        this.tipos = data.map(t => ({
          id_tipo_reserva: t.idTipoReserva,
          nombre_tipo: t.nombreTipo,
          descripcion: t.descripcion,
          estado: t.estado as 'Activo' | 'Inactivo'
        }));
        this.tiposFiltrados = [...this.tipos];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando tipos:', err)
    });
  }
}
