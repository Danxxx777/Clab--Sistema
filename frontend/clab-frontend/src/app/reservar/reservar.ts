import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TipoReservaService } from '../services/tipo-reserva.service';
import { ChangeDetectorRef } from '@angular/core';
import { ReservaService } from '../services/reserva.service';
import { LaboratorioService } from '../services/laboratorio.service';
import { AsignaturaService } from '../services/asignatura.service';
import { PeriodoService } from '../services/periodo.service';
import { HorarioService } from '../services/horario.service';

/*INTERFACES*/

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
  estado: 'Pendiente' | 'Aprobada' | 'Cancelada' | 'Completada' | 'Rechazada';
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
  hora_inicio: string;
  hora_fin: string;
  id_asignatura: number;
}

interface Usuario {
  id_usuario: number;
  nombres: string;
  apellidos: string;
}

/*
   COMPONENTE
 */
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
    private reservaService: ReservaService,
    private laboratorioService: LaboratorioService,
    private asignaturaService: AsignaturaService,
    private periodoService: PeriodoService,
    private horarioService: HorarioService,
    private cdr: ChangeDetectorRef
  ) {}

  /*
     TABS
   */
  tabActiva = 0;
  drawerAbierto = false;
  rol = sessionStorage.getItem('rol') || '';
  usuarioLogueado = sessionStorage.getItem('usuario') || 'Usuario';
  idUsuario= 0;
  reservaDetalle: any = null;
  mostrarModalDetalle = false;

  cambiarTab(tab: number) {
    this.tabActiva = tab;
  }

  /*
     LISTAS PRINCIPALES
  */

  reservas: Reserva[] = [];
  reservasFiltradas: Reserva[] = [];

  tipos: TipoReserva[] = [];
  tiposFiltrados: TipoReserva[] = [];

  /*
     LISTAS SELECTS
   */

  laboratorios: Laboratorio[] = [];
  asignaturas: Asignatura[] = [];
  periodos: Periodo[] = [];
  horariosAcademicos: HorarioAcademico[] = [];
  usuarios: Usuario[] = [];

  /*
     BUSQUEDAS
   */

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

  totalPorEstado(estado: string): number {
    return this.reservas.filter(r => r.estado === estado).length;
  }

  /*
     MODALES - RESERVA / TIPO
  */

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
    if (tipo === 'reserva') {
      this.cargarTodosLosHorarios();
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.tipoModal = null;
  }

  cerrarModalConfirmar() {
    this.mostrarConfirmarEliminar = false;
  }

  /*
     MODAL - CANCELAR RESERVA
   */

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

  onHorarioChange(): void {
    const idHorario = this.formularioReserva.id_horario_academico;
    if (!idHorario) {
      this.formularioReserva.hora_inicio = '';
      this.formularioReserva.hora_fin = '';
      return;
    }
    const horario = this.horariosAcademicos.find(h => h.id_horario_academico == idHorario);
    if (horario) {
      this.formularioReserva.hora_inicio = horario.hora_inicio;
      this.formularioReserva.hora_fin = horario.hora_fin;
      this.formularioReserva.id_asignatura = horario.id_asignatura;
      this.cdr.detectChanges();
    }
  }

  cargarTodosLosHorarios(): void {
    this.horarioService.listar().subscribe({
      next: (data) => {
        this.horariosAcademicos = data.map(h => ({
          id_horario_academico: h.idHorario,
          nombre_asignatura: h.nombreAsignatura || '',
          dia_semana: h.diaSemana,
          hora_inicio: h.horaInicio,
          hora_fin: h.horaFin,
          id_asignatura: h.idAsignatura
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando horarios:', err)
    });
  }

  confirmarCancelacion() {
    if (!this.formularioCancelacion.motivo_cancelacion?.trim()) {
      this.mostrarNotificacion('El motivo de cancelación es obligatorio', 'error');
      return;
    }

    const dto = {
      idReserva: this.formularioCancelacion.id_reserva,
      idUsuarioCancela: this.formularioCancelacion.id_usuario_cancela || 1,
      motivoCancelacion: this.formularioCancelacion.motivo_cancelacion
    };

    this.reservaService.cancelar(dto).subscribe({
      next: () => {
        this.cargarReservas();
        this.cerrarModalCancelar();
        this.mostrarNotificacion('🗑️ Reserva cancelada exitosamente');
      },
      error: (err) => {
        console.error('Error cancelando reserva:', err);
        this.mostrarNotificacion('❌ Error al cancelar la reserva', 'error');
      }
    });
  }

  /*
     FORMULARIOS
 */

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
      id_usuario: this.idUsuario,
      descripcion: '',
      motivo: '',
      estado: 'Aprobada'
    };
    this.formularioTipo = {
      nombre_tipo: '',
      descripcion: '',
      estado: 'Activo'
    };
  }

  /*
     CRUD RESERVAS
  */

  guardarReserva() {
    if (!this.formularioReserva.cod_laboratorio ||
      !this.formularioReserva.fecha_reserva ||
      !this.formularioReserva.hora_inicio ||
      !this.formularioReserva.hora_fin) {
      this.mostrarNotificacion('Complete los campos obligatorios', 'error');
      return;
    }

    const dto = {
      codLaboratorio: this.formularioReserva.cod_laboratorio,
      idUsuario: this.idUsuario,
      idPeriodo: this.formularioReserva.id_periodo || 1,
      idHorarioAcademico: this.formularioReserva.id_horario_academico || 1,
      idAsignatura: this.formularioReserva.id_asignatura,
      idTipoReserva: this.formularioReserva.id_tipo_reserva,
      fechaReserva: this.formularioReserva.fecha_reserva,
      horaInicio: this.formularioReserva.hora_inicio,
      horaFin: this.formularioReserva.hora_fin,
      motivo: this.formularioReserva.motivo,
      numeroEstudiantes: this.formularioReserva.numero_estudiantes,
      descripcion: this.formularioReserva.descripcion
    };

    if (this.modoEdicion && this.indexSeleccionado !== null) {
      const id = this.reservas[this.indexSeleccionado].id_reserva;
      this.reservaService.actualizar(id, dto).subscribe({
        next: () => {
          this.cargarReservas();
          this.cerrarModal();
          this.mostrarNotificacion('✅ Reserva actualizada correctamente');
        },
        error: (err) => {
          console.error('Error actualizando reserva:', err);
          this.mostrarNotificacion('❌ Error al actualizar la reserva', 'error');
        }
      });
    } else {
      this.reservaService.crearAdmin(dto).subscribe({  // ← cambia crear por crearAdmin
        next: () => {
          this.cargarReservas();
          this.cerrarModal();
          this.mostrarNotificacion('✅ Reserva creada exitosamente');
        },
        error: (err) => {
          console.error('Error creando reserva:', err);
          this.mostrarNotificacion('❌ Error al crear la reserva', 'error');
        }
      });
    }
  }

  editarReserva(res: Reserva, index: number) {
    this.modoEdicion = true;
    this.tipoModal = 'reserva';
    this.mostrarModal = true;
    this.indexSeleccionado = index;
    this.formularioReserva = { ...res };
  }

  /*
     CRUD TIPOS
   */

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

  // ESTO ES PARA CARGAR RESERVAS

  cargarReservas(): void {
    this.reservaService.listar().subscribe({
      next: (data) => {
        this.reservas = data.map(r => ({
          id_reserva: r.idReserva,
          cod_laboratorio: r.codLaboratorio,
          nombre_laboratorio: r.nombreLaboratorio,
          fecha_reserva: r.fechaReserva,
          fecha_solicitud: r.fechaSolicitud,
          hora_inicio: r.horaInicio,
          hora_fin: r.horaFin,
          id_asignatura: r.idAsignatura,
          nombre_asignatura: r.nombreAsignatura || '-',
          id_periodo: r.idPeriodo,
          nombre_periodo: r.nombrePeriodo,
          numero_estudiantes: r.numeroEstudiantes,
          id_tipo_reserva: r.idTipoReserva,
          nombre_tipo: r.nombreTipoReserva || '-',
          id_usuario: r.idUsuario,
          estado: r.estado as 'Pendiente' | 'Aprobada' | 'Cancelada' | 'Completada' | 'Rechazada',
          descripcion: r.descripcion || '',
          motivo: r.motivo
        }));
        this.reservasFiltradas = [...this.reservas];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando reservas:', err);
        this.mostrarNotificacion('Error al cargar reservas', 'error');
      }
    });
  }

  aprobarReserva(res: any): void {
    this.reservaService.aprobar(res.id_reserva).subscribe({
      next: () => {
        this.cargarReservas();
        this.mostrarNotificacion('✅ Reserva aprobada correctamente');
      },
      error: (err) => {
        console.error('Error aprobando:', err);
        this.mostrarNotificacion('❌ Error al aprobar la reserva', 'error');
      }
    });
  }

  rechazarReserva(res: any): void {
    this.reservaService.rechazar(res.id_reserva).subscribe({
      next: () => {
        this.cargarReservas();
        this.mostrarNotificacion('🚫 Reserva rechazada');
      },
      error: (err) => {
        console.error('Error rechazando:', err);
        this.mostrarNotificacion('❌ Error al rechazar la reserva', 'error');
      }
    });
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

  verDetalle(res: Reserva): void {
    this.reservaDetalle = res;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.reservaDetalle = null;
  }
  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }

  navegar(ruta: string, texto: string): void {
    this.cerrarDrawer();
    this.router.navigate([`/${ruta}`]);
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
  volver() {
    this.router.navigate(['/dashboard']);
  }

  /*
     INIT
 */

  ngOnInit(): void {
    this.rol = sessionStorage.getItem('rol') || '';
    this.usuarioLogueado = sessionStorage.getItem('usuario') || 'Usuario';
    this.cargarTipos();
    this.cargarReservas();
    this.cargarLaboratorios();
    this.cargarAsignaturas();
    this.cargarPeriodos();

    this.laboratorios = [];
    this.asignaturas = [];
    this.periodos = [];
    this.horariosAcademicos = [];
    this.usuarios = [];

    this.reservasFiltradas = [...this.reservas];
    this.idUsuario = parseInt(sessionStorage.getItem('idUsuario') || '0');
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

  cargarLaboratorios(): void {
    this.laboratorioService.listar().subscribe({
      next: (data) => {
        this.laboratorios = data.map(l => ({
          cod_laboratorio: l.codLaboratorio,
          nombre: l.nombreLab
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando laboratorios:', err)
    });
  }

  cargarAsignaturas(): void {
    this.asignaturaService.listar().subscribe({
      next: (data) => {
        this.asignaturas = data.map(a => ({
          id_asignatura: a.idAsignatura || 0,
          nombre: a.nombre
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando asignaturas:', err)
    });
  }

  cargarPeriodos(): void {
    this.periodoService.listar().subscribe({
      next: (data) => {
        this.periodos = data.map(p => ({
          id_periodo: p.idPeriodo || 0,
          nombre_periodo: p.nombrePeriodo
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando periodos:', err)
    });
  }

  cargarHorariosPorAsignatura(idAsignatura: number): void {
    this.horarioService.listarPorAsignatura(idAsignatura).subscribe({
      next: (data) => {
        this.horariosAcademicos = data.map(h => ({
          id_horario_academico: h.idHorarioAcademico,
          nombre_asignatura: h.nombreAsignatura || '',
          dia_semana: h.diaSemana,
          hora_inicio: h.horaInicio,
          hora_fin: h.horaFin,
          id_asignatura: h.idAsignatura
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando horarios:', err)
    });
  }

  onAsignaturaChange(): void {
    const idAsignatura = this.formularioReserva.id_asignatura;
    if (idAsignatura) {
      this.cargarHorariosPorAsignatura(idAsignatura);
    } else {
      this.horariosAcademicos = [];
    }
  }
}
