import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  motivo_cancelacion?: string;
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

  constructor(private router: Router) {}

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
     MODALES
  ========================= */

  mostrarModal = false;
  mostrarConfirmarEliminar = false;
  tipoModal: 'reserva' | 'tipo' | null = null;
  modoEdicion = false;

  tipoAccion: 'cancelar' | 'eliminar' = 'eliminar';
  itemSeleccionado: any = null;
  indexSeleccionado: number | null = null;

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
      id_usuario_cancela: null,
      descripcion: '',
      motivo_cancelacion: '',
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

  eliminarReserva(res: Reserva, index: number) {
    this.tipoAccion = 'cancelar';
    this.itemSeleccionado = res;
    this.indexSeleccionado = index;
    this.mostrarConfirmarEliminar = true;
  }

  /* =========================
     CRUD TIPOS
  ========================= */

  guardarTipo() {

    if (this.modoEdicion && this.indexSeleccionado !== null) {

      this.tipos[this.indexSeleccionado] = {
        ...this.tipos[this.indexSeleccionado],
        ...this.formularioTipo
      };

    } else {

      const nuevoTipo: TipoReserva = {
        id_tipo_reserva: Date.now(),
        ...this.formularioTipo
      };

      this.tipos.push(nuevoTipo);
    }

    this.tiposFiltrados = [...this.tipos];
    this.cerrarModal();
  }

  editarTipo(tipo: TipoReserva, index: number) {
    this.modoEdicion = true;
    this.tipoModal = 'tipo';
    this.mostrarModal = true;
    this.indexSeleccionado = index;
    this.formularioTipo = { ...tipo };
  }

  eliminarTipo(tipo: TipoReserva, index: number) {
    this.tipoAccion = 'eliminar';
    this.itemSeleccionado = tipo;
    this.indexSeleccionado = index;
    this.mostrarConfirmarEliminar = true;
  }

  confirmarEliminacion() {

    if (this.indexSeleccionado !== null) {

      if (this.tipoAccion === 'cancelar') {
        this.reservas.splice(this.indexSeleccionado, 1);
        this.reservasFiltradas = [...this.reservas];
      } else {
        this.tipos.splice(this.indexSeleccionado, 1);
        this.tiposFiltrados = [...this.tipos];
      }
    }

    this.cerrarModalConfirmar();
  }

  getItemNombre(): string {
    if (!this.itemSeleccionado) return '';
    return this.itemSeleccionado.nombre_laboratorio || this.itemSeleccionado.nombre_tipo || '';
  }

  getEstadoBadgeClass(estado: string): string {
    return estado.toLowerCase();
  }

  importarHorariosSGA() {
    alert('Importación desde SGA pendiente');
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

    this.laboratorios = [
      { cod_laboratorio: 1, nombre: 'Lab Computación A' },
      { cod_laboratorio: 2, nombre: 'Lab Redes' }
    ];

    this.asignaturas = [
      { id_asignatura: 1, nombre: 'Programación I' },
      { id_asignatura: 2, nombre: 'Base de Datos' }
    ];

    this.periodos = [
      { id_periodo: 1, nombre_periodo: '2025-A' },
      { id_periodo: 2, nombre_periodo: '2025-B' }
    ];

    this.horariosAcademicos = [
      { id_horario_academico: 1, nombre_asignatura: 'Programación I', dia_semana: 'Lunes' }
    ];

    this.usuarios = [
      { id_usuario: 1, nombres: 'Byron', apellidos: 'Loor' },
      { id_usuario: 2, nombres: 'Allison', apellidos: 'Mera' }
    ];

    this.tipos = [
      {
        id_tipo_reserva: 1,
        nombre_tipo: 'Clase Regular',
        descripcion: 'Reserva para clases normales',
        estado: 'Activo'
      }
    ];

    this.tiposFiltrados = [...this.tipos];
    this.reservasFiltradas = [...this.reservas];
  }
}
