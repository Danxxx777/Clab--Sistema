import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { TipoReservaService } from '../services/tipo-reserva.service';
import { ReservaService } from '../services/reserva.service';
import { LaboratorioService } from '../services/laboratorio.service';
import { AsignaturaService } from '../services/asignatura.service';
import { PeriodoService } from '../services/periodo.service';
import { HorarioService } from '../services/horario.service';
import { AsistenciaUsuarioService } from '../services/asistencia-usuario.service';
import { AuthService } from '../auth/auth.service';
import {
  Reserva, Cancelacion, TipoReserva, Laboratorio,
  Asignatura, Periodo, HorarioAcademico, Usuario
} from '../interfaces/Reservar.model';

interface ReservaCalendario {
  id: number;
  laboratorio: string;
  dia: number;
  horaInicio: number;
  duracion: number;
  titulo: string;
  docente: string;
  estado: string;
  fecha: Date;
  horaInicioStr: string;
  horaFinStr: string;
}

const PALETA = [
  '#39ff14', '#22c55e', '#86efac', '#bbf7d0',
  '#16a34a', '#4ade80', '#15803d', '#dcfce7', '#14532d'
];

@Component({
  selector: 'app-reservar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservar.html',
  styleUrls: ['./reservar.scss']
})
export class ReservarComponent implements OnInit {

  private apiUrl = 'http://localhost:8080';

  constructor(
    private router: Router,
    private tipoReservaService: TipoReservaService,
    private reservaService: ReservaService,
    private laboratorioService: LaboratorioService,
    private asignaturaService: AsignaturaService,
    private periodoService: PeriodoService,
    private horarioService: HorarioService,
    private cdr: ChangeDetectorRef,
    private asistenciaUsuarioService: AsistenciaUsuarioService,
    private http: HttpClient,
    private auth: AuthService
  ) {}

  // ══ TABS ══════════════════════════════════════════════════════════════════
  tabActiva: number = 0;
  drawerAbierto = false;
  rol = localStorage.getItem('rol') || '';
  usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';
  idUsuario = 0;
  reservaDetalle: any = null;
  mostrarModalDetalle = false;
  paginaActual = 1;
  itemsPorPagina = 6;
  paginaActualTipos = 1;
  itemsPorPaginaTipos = 6;

  cambiarTab(tab: number): void {
    this.tabActiva = tab;
    if (tab === 3) {
      this.cargarReservasHoy();
      this.cargarUsuariosBloqueados();
    }
    if (tab === 0) {
      this.cal_vistaActiva = 'Semana';
      this.cal_calcularSemanaActual();
      this.cal_cargarReservas();
    }
  }

  // ══ LISTAS PRINCIPALES ════════════════════════════════════════════════════
  reservas: Reserva[] = [];
  reservasFiltradas: Reserva[] = [];
  tipos: TipoReserva[] = [];
  tiposFiltrados: TipoReserva[] = [];

  // ══ LISTAS SELECTS ════════════════════════════════════════════════════════
  laboratorios: Laboratorio[] = [];
  asignaturas: Asignatura[] = [];
  periodos: Periodo[] = [];
  horariosAcademicos: HorarioAcademico[] = [];
  usuarios: Usuario[] = [];

  // ══ BÚSQUEDAS ════════════════════════════════════════════════════════════
  busquedaReservas = '';
  busquedaTipos = '';
  reservasHoy: any[] = [];
  usuariosBloqueados: any[] = [];

  horasDisponibles: string[] = [
    '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];
  timePickerAbierto: string | null = null;

  grupos: any[] = [];
  reservasCombinadas: any[] = [];
  reservasCombinadasFiltradas: any[] = [];

  cerrarTimePickerSiAfuera(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.time-picker-wrap')) {
      this.timePickerAbierto = null;
    }
  }

  toggleTimePicker(cual: string, event?: MouseEvent) {
    if (this.timePickerAbierto === cual) {
      this.timePickerAbierto = null;
      return;
    }
    this.timePickerAbierto = cual;
    setTimeout(() => {
      const input = (event?.target as HTMLElement)?.closest('.time-picker-wrap')
        ?.querySelector('.time-display') as HTMLElement;
      const dropdown = (event?.target as HTMLElement)?.closest('.time-picker-wrap')
        ?.querySelector('.time-picker-dropdown') as HTMLElement;
      if (input && dropdown) {
        const rect = input.getBoundingClientRect();
        dropdown.style.top  = `${rect.bottom + 4}px`;
        dropdown.style.left = `${rect.left}px`;
      }
    }, 0);
  }

  selectHora(cual: string, hora: string) {
    if (cual === 'inicio') this.formularioReserva.hora_inicio = hora;
    else this.formularioReserva.hora_fin = hora;
    this.timePickerAbierto = null;
  }

  filtrarReservas(): void {
    const texto = this.busquedaReservas.toLowerCase();
    this.reservasCombinadasFiltradas = this.reservasCombinadas.filter(r =>
      r.nombre_laboratorio?.toLowerCase().includes(texto) ||
      r.nombre_asignatura?.toLowerCase().includes(texto) ||
      r.nombre_periodo?.toLowerCase().includes(texto)
    );
    this.paginaActual = 1;
  }

  filtrarTipos(): void {
    const texto = this.busquedaTipos.toLowerCase();
    this.tiposFiltrados = this.tipos.filter(t =>
      t.nombre_tipo.toLowerCase().includes(texto)
    );
  }

  totalPorEstado(estado: string): number {
    return this.reservas.filter(r => r.estado === estado).length;
  }

  // ══ GETTER: tipo sin asignatura ══════════════════════════════════════════
  get tipoSinAsignatura(): boolean {
    const tipo = this.tipos.find(t => t.id_tipo_reserva === Number(this.formularioReserva.id_tipo_reserva));
    if (!tipo) return false;
    const nombre = tipo.nombre_tipo?.toLowerCase() || '';
    return nombre.includes('capacitacion') || nombre.includes('capacitación') ||
      nombre.includes('sustentacion') || nombre.includes('sustentación') ||
      nombre.includes('tesis');
  }

  // ══ MODALES ══════════════════════════════════════════════════════════════
  mostrarModal = false;
  mostrarConfirmarEliminar = false;
  tipoModal: 'reserva' | 'tipo' | null = null;
  modoEdicion = false;
  itemSeleccionado: any = null;
  indexSeleccionado: number | null = null;
  mostrarToast = false;
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';

  abrirModal(tipo: 'reserva' | 'tipo'): void {
    this.tipoModal = tipo;
    this.modoEdicion = false;
    this.mostrarModal = true;
    this.resetFormularios();
    if (tipo === 'reserva') { this.cargarTodosLosHorarios(); }
  }

  cerrarModal(): void { this.mostrarModal = false; this.tipoModal = null; }
  cerrarModalConfirmar(): void { this.mostrarConfirmarEliminar = false; }

  // ══ MODAL CANCELAR ═══════════════════════════════════════════════════════
  mostrarModalCancelar = false;
  formularioCancelacion: Cancelacion = {
    id_reserva: 0, id_usuario_cancela: 0,
    fecha_cancelacion: '', motivo_cancelacion: ''
  };

  abrirModalCancelar(res: Reserva, index: number): void {
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

  cerrarModalCancelar(): void {
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
      this.formularioReserva.hora_inicio   = horario.hora_inicio;
      this.formularioReserva.hora_fin      = horario.hora_fin;
      this.formularioReserva.id_asignatura = horario.id_asignatura;
      if (this.formularioReserva.esRecurrente) {
        const diaMapper: Record<string, string> = {
          'LUNES': 'LUNES', 'MARTES': 'MARTES', 'MIÉRCOLES': 'MIÉRCOLES',
          'JUEVES': 'JUEVES', 'VIERNES': 'VIERNES', 'SÁBADO': 'SÁBADO', 'DOMINGO': 'DOMINGO'
        };
        const dia = diaMapper[horario.dia_semana?.toUpperCase()];
        if (dia) { this.formularioReserva.diasSemana = [dia]; }
      }
      this.cdr.detectChanges();
    }
  }

  onTipoReservaChange(): void {
    if (this.tipoSinAsignatura) {
      this.formularioReserva.id_asignatura = null;
      this.formularioReserva.id_horario_academico = null;
      this.horariosAcademicos = [];
    }
    this.cdr.detectChanges();
  }

  toggleDia(dia: string): void {
    const idx = this.formularioReserva.diasSemana.indexOf(dia);
    if (idx === -1) { this.formularioReserva.diasSemana.push(dia); }
    else { this.formularioReserva.diasSemana.splice(idx, 1); }
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

  filtroEstadoActivo = '';

  filtrarPorEstado(estado: string): void {
    if (this.filtroEstadoActivo === estado || estado === 'Total') {
      this.filtroEstadoActivo = estado === 'Total' ? 'Total' : '';
      this.reservasCombinadasFiltradas = [...this.reservasCombinadas];
    } else {
      this.filtroEstadoActivo = estado;
      this.reservasCombinadasFiltradas = this.reservasCombinadas.filter(r => r.estado === estado);
    }
    this.paginaActual = 1;
    this.cdr.detectChanges();
  }

  confirmarCancelacion(): void {
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
      next: () => { this.cargarReservas(); this.cerrarModalCancelar(); this.mostrarNotificacion('🗑️ Reserva cancelada exitosamente'); },
      error: () => this.mostrarNotificacion('❌ Error al cancelar la reserva', 'error')
    });
  }

  // ══ FORMULARIOS ══════════════════════════════════════════════════════════
  formularioReserva: any = {};
  formularioTipo: any = {};

  resetFormularios(): void {
    this.formularioReserva = {
      cod_laboratorio: 0, id_asignatura: 0, id_periodo: 0,
      id_horario_academico: null, fecha_reserva: '', fecha_solicitud: '',
      hora_inicio: '', hora_fin: '', numero_estudiantes: 1,
      id_tipo_reserva: 0, id_usuario: this.idUsuario,
      descripcion: '', motivo: '', estado: 'Aprobada',
      esRecurrente: false,
      diasSemana: [] as string[]
    };
    this.formularioTipo = { nombre_tipo: '', descripcion: '', estado: 'Activo' };
  }

  // ══ VERIFICAR BLOQUEO ════════════════════════════════════════════════════
  verificarBloqueoLab(codLaboratorio: number, fecha: string): Observable<boolean> {
    return this.http.get<any[]>(`${this.apiUrl}/bloqueos`).pipe(
      map(bloqueos => {
        const fechaReserva = new Date(fecha + 'T00:00:00');
        return bloqueos.some(b => {
          if (Number(b.codLaboratorio) !== Number(codLaboratorio)) return false;
          if (b.estado?.toLowerCase() !== 'activo') return false;
          const inicio = new Date(b.fechaInicio + 'T00:00:00');
          const fin    = new Date(b.fechaFin    + 'T00:00:00');
          return fechaReserva >= inicio && fechaReserva <= fin;
        });
      })
    );
  }

  // ══ CRUD RESERVAS ════════════════════════════════════════════════════════
  guardarReserva(): void {
    if (this.formularioReserva.esRecurrente) {
      if (!this.formularioReserva.cod_laboratorio ||
        !this.formularioReserva.id_periodo ||
        !this.formularioReserva.diasSemana.length ||
        !this.formularioReserva.hora_inicio ||
        !this.formularioReserva.hora_fin) {
        this.mostrarNotificacion('Complete todos los campos obligatorios', 'error');
        return;
      }
      const dto = {
        codLaboratorio:     this.formularioReserva.cod_laboratorio,
        idUsuario:          this.idUsuario,
        idPeriodo:          this.formularioReserva.id_periodo,
        idHorarioAcademico: this.formularioReserva.id_horario_academico || null,
        idAsignatura:       this.tipoSinAsignatura ? null : (this.formularioReserva.id_asignatura || null),
        idTipoReserva:      this.formularioReserva.id_tipo_reserva || null,
        diasSemana:         this.formularioReserva.diasSemana.join(','),
        horaInicio:         this.formularioReserva.hora_inicio,
        horaFin:            this.formularioReserva.hora_fin,
        motivo:             this.formularioReserva.motivo,
        numeroEstudiantes:  this.formularioReserva.numero_estudiantes,
        descripcion:        this.formularioReserva.descripcion
      };
      this.reservaService.crearRecurrente(dto).subscribe({
        next: () => {
          this.cargarReservas(); this.cargarGrupos(); this.cerrarModal();
          this.mostrarNotificacion('✅ Reservas recurrentes creadas para todo el período');
          if (this.tabActiva === 0) this.cal_cargarReservas();
        },
        error: (err) => this.mostrarNotificacion('❌ ' + (err.error?.message || 'Error al crear reservas recurrentes'), 'error')
      });
    } else {
      if (!this.formularioReserva.cod_laboratorio ||
        !this.formularioReserva.fecha_reserva ||
        !this.formularioReserva.hora_inicio ||
        !this.formularioReserva.hora_fin) {
        this.mostrarNotificacion('Complete los campos obligatorios', 'error'); return;
      }
      const dto = {
        codLaboratorio: this.formularioReserva.cod_laboratorio,
        idUsuario: this.idUsuario,
        idPeriodo: this.formularioReserva.id_periodo || 1,
        idHorarioAcademico: this.formularioReserva.id_horario_academico || null,
        idAsignatura: this.tipoSinAsignatura ? null : (this.formularioReserva.id_asignatura || null),
        idTipoReserva: this.formularioReserva.id_tipo_reserva,
        fechaReserva: this.formularioReserva.fecha_reserva,
        horaInicio: this.formularioReserva.hora_inicio,
        horaFin: this.formularioReserva.hora_fin,
        motivo: this.formularioReserva.motivo,
        numeroEstudiantes: this.formularioReserva.numero_estudiantes,
        descripcion: this.formularioReserva.descripcion
      };
      if (this.modoEdicion && this.indexSeleccionado !== null) {
        const id = this.formularioReserva.id_reserva;
        this.reservaService.actualizar(id, dto).subscribe({
          next: () => { this.cargarReservas(); this.cerrarModal(); this.mostrarNotificacion('✅ Reserva actualizada correctamente'); },
          error: () => this.mostrarNotificacion('❌ Error al actualizar la reserva', 'error')
        });
      } else {
        // Verificar bloqueo antes de crear
        this.verificarBloqueoLab(
          this.formularioReserva.cod_laboratorio,
          this.formularioReserva.fecha_reserva
        ).subscribe(estaBloqueado => {
          if (estaBloqueado) {
            this.mostrarNotificacion('❌ El laboratorio está bloqueado en esa fecha', 'error');
            this.cdr.detectChanges();
            return;
          }
          this.reservaService.crearAdmin(dto).subscribe({
            next: () => {
              this.cargarReservas();
              this.cerrarModal();
              this.mostrarNotificacion('✅ Reserva creada exitosamente');
              if (this.tabActiva === 0) { this.cal_cargarReservas(); }
            },
            error: (err) => {
              const rawMsg: string = err.error?.mensaje || err.error?.message ||
                err.error?.error || err.message || '';
              let mensajeUsuario = 'Error al crear la reserva';
              if (rawMsg.toLowerCase().includes('ya está reservado') ||
                rawMsg.toLowerCase().includes('ya esta reservado')) {
                mensajeUsuario = '❌ El laboratorio ya está reservado en ese horario';
              } else if (rawMsg.toLowerCase().includes('bloqueado')) {
                mensajeUsuario = '❌ El laboratorio está bloqueado en esa fecha';
              } else if (rawMsg) {
                mensajeUsuario = '❌ ' + rawMsg;
              }
              this.mostrarNotificacion(mensajeUsuario, 'error');
            }
          });
        });
      }
    }
  }

  cargarGrupos(): void {
    this.reservaService.listarGrupos().subscribe({
      next: (data) => {
        this.grupos = data.filter(g => g.estado !== 'Cancelada');
        this.combinarReservas();
        this.cdr.detectChanges();
      },
      error: () => this.mostrarNotificacion('Error al cargar grupos', 'error')
    });
  }

  combinarReservas(): void {
    const gruposFormateados = this.grupos.map(g => ({
      ...g,
      esGrupo: true,
      nombre_laboratorio: g.nombreLaboratorio,
      nombre_asignatura:  g.nombreAsignatura,
      nombre_periodo:     g.nombrePeriodo,
      nombre_tipo:        g.nombreTipoReserva,
      hora_inicio:        g.horaInicio,
      hora_fin:           g.horaFin,
      estado:             g.estado,
      numero_estudiantes: g.numeroEstudiantes,
      fecha_orden:        g.fechaCreacion
    }));
    const reservasFormateadas = this.reservas.map(r => ({
      ...r, esGrupo: false, fecha_orden: r.fecha_solicitud
    }));
    this.reservasCombinadas = [...gruposFormateados, ...reservasFormateadas]
      .sort((a, b) => new Date(b.fecha_orden).getTime() - new Date(a.fecha_orden).getTime());
    if (this.filtroEstadoActivo && this.filtroEstadoActivo !== 'Total') {
      this.reservasCombinadasFiltradas = this.reservasCombinadas.filter(r => r.estado === this.filtroEstadoActivo);
    } else {
      this.reservasCombinadasFiltradas = [...this.reservasCombinadas];
    }
  }

  editarReserva(res: Reserva, index: number): void {
    this.modoEdicion = true; this.tipoModal = 'reserva'; this.mostrarModal = true;
    this.indexSeleccionado = this.reservas.findIndex(r => r.id_reserva === res.id_reserva);
    this.formularioReserva = { ...res };
  }

  // ══ CRUD TIPOS ═══════════════════════════════════════════════════════════
  guardarTipo(): void {
    if (!this.formularioTipo.nombre_tipo?.trim()) {
      this.mostrarNotificacion('El nombre del tipo es obligatorio', 'error'); return;
    }
    const dto = { nombreTipo: this.formularioTipo.nombre_tipo, descripcion: this.formularioTipo.descripcion || '' };
    if (this.modoEdicion && this.indexSeleccionado !== null) {
      const id = this.tipos[this.indexSeleccionado].id_tipo_reserva;
      this.tipoReservaService.actualizar(id, dto).subscribe({
        next: () => { this.cargarTipos(); this.cerrarModal(); this.mostrarNotificacion('✅ Tipo actualizado'); },
        error: () => this.mostrarNotificacion('❌ Error al actualizar el tipo', 'error')
      });
    } else {
      this.tipoReservaService.crear(dto).subscribe({
        next: () => { this.cargarTipos(); this.cerrarModal(); this.mostrarNotificacion('✅ Tipo creado'); },
        error: () => this.mostrarNotificacion('❌ Error al crear el tipo', 'error')
      });
    }
  }

  editarTipo(tipo: TipoReserva, index: number): void {
    this.modoEdicion = true; this.tipoModal = 'tipo'; this.mostrarModal = true;
    this.indexSeleccionado = index; this.formularioTipo = { ...tipo };
  }

  eliminarTipo(tipo: TipoReserva, index: number): void {
    this.itemSeleccionado = tipo; this.indexSeleccionado = index;
    this.mostrarConfirmarEliminar = true;
  }

  cargarReservas(): void {
    const idUsuario = parseInt(localStorage.getItem('idUsuario') || '0');
    const obs = (this.rol === 'Encargado de Laboratorio' ||
      this.rol === 'Encargado_Lab' ||
      this.rol === 'clab_encargado_lab')
      ? this.reservaService.listarPorEncargado(idUsuario)
      : this.reservaService.listar();
    obs.subscribe({
      next: (data) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        this.reservas = data
          .filter(r => {
            if (r.estado === 'Cancelada' || r.idGrupoReserva) return false;
            const fechaReserva = new Date(r.fechaReserva + 'T00:00:00');
            return fechaReserva >= hoy;
          })
          .map(r => ({
            id_reserva: r.idReserva, cod_laboratorio: r.codLaboratorio,
            nombre_laboratorio: r.nombreLaboratorio, fecha_reserva: r.fechaReserva,
            fecha_solicitud: r.fechaSolicitud, hora_inicio: r.horaInicio, hora_fin: r.horaFin,
            id_asignatura: r.idAsignatura, nombre_asignatura: r.nombreAsignatura || '-',
            id_periodo: r.idPeriodo, nombre_periodo: r.nombrePeriodo,
            numero_estudiantes: r.numeroEstudiantes, id_tipo_reserva: r.idTipoReserva,
            nombre_tipo: r.nombreTipoReserva || '-', id_usuario: r.idUsuario,
            estado: r.estado as 'Pendiente' | 'Aprobada' | 'Cancelada' | 'Completada' | 'Rechazada',
            descripcion: r.descripcion || '', motivo: r.motivo
          }));
        this.reservasFiltradas = [...this.reservas];
        this.combinarReservas();
        this.cdr.detectChanges();
      },
      error: () => this.mostrarNotificacion('Error al cargar reservas', 'error')
    });
  }

  aprobarReserva(res: any): void {
    this.reservaService.aprobar(res.id_reserva).subscribe({
      next: () => { this.cargarReservas(); this.mostrarNotificacion('✅ Reserva aprobada correctamente'); },
      error: () => this.mostrarNotificacion('❌ Error al aprobar la reserva', 'error')
    });
  }

  rechazarReserva(res: any): void {
    this.reservaService.rechazar(res.id_reserva).subscribe({
      next: () => { this.cargarReservas(); this.mostrarNotificacion('🚫 Reserva rechazada'); },
      error: () => this.mostrarNotificacion('❌ Error al rechazar la reserva', 'error')
    });
  }

  confirmarEliminacion(): void {
    if (this.indexSeleccionado !== null) {
      const id = this.tipos[this.indexSeleccionado].id_tipo_reserva;
      this.tipoReservaService.eliminar(id).subscribe({
        next: () => { this.cargarTipos(); this.cerrarModalConfirmar(); this.mostrarNotificacion('🗑️ Tipo eliminado'); },
        error: () => this.mostrarNotificacion('❌ Error al eliminar el tipo', 'error')
      });
    }
  }

  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    this.toastMensaje = mensaje; this.toastTipo = tipo; this.mostrarToast = true;
    setTimeout(() => { this.mostrarToast = false; this.cdr.detectChanges(); }, 3000);
  }

  getItemNombre(): string { return this.itemSeleccionado?.nombre_tipo || ''; }
  getEstadoBadgeClass(estado: string): string { return estado.toLowerCase(); }
  verDetalle(res: Reserva): void { this.reservaDetalle = res; this.mostrarModalDetalle = true; }
  cerrarModalDetalle(): void { this.mostrarModalDetalle = false; this.reservaDetalle = null; }
  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }
  navegar(ruta: string, _texto = ''): void { this.cerrarDrawer(); this.router.navigate([`/${ruta}`]); }
  logout(): void { localStorage.clear(); this.router.navigate(['/login']); }
  volver(): void { this.router.navigate(['/dashboard']); }

  // ══ INIT ═════════════════════════════════════════════════════════════════
  ngOnInit(): void {
    this.rol = localStorage.getItem('rol') || '';
    this.usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';
    this.idUsuario = parseInt(localStorage.getItem('idUsuario') || '0');
    this.cargarTipos();
    this.cargarReservas();
    this.cargarLaboratorios();
    this.cargarAsignaturas();
    this.cargarPeriodos();
    this.cargarGrupos();
    this.reservasFiltradas = [...this.reservas];
    if (this.rol === 'Encargado_Lab' || this.rol === 'clab_encargado_lab' || this.rol === 'Encargado de Laboratorio') {
      this.cargarReservasHoy();
      this.cargarUsuariosBloqueados();
    }
    this.cal_calcularSemanaActual();
    this.cal_mesActual = new Date(this.cal_fechaInicioSemana.getFullYear(), this.cal_fechaInicioSemana.getMonth(), 1);
    this.cal_cargarReservas();
  }

  cargarTipos(): void {
    this.tipoReservaService.listar().subscribe({
      next: (data) => {
        this.tipos = data.map(t => ({
          id_tipo_reserva: t.idTipoReserva, nombre_tipo: t.nombreTipo,
          descripcion: t.descripcion, estado: t.estado as 'Activo' | 'Inactivo'
        }));
        this.tiposFiltrados = [...this.tipos];
        this.cdr.detectChanges();
      }
    });
  }

  cargarLaboratorios(): void {
    this.laboratorioService.listar().subscribe({
      next: (data) => {
        this.laboratorios = data.map(l => ({ cod_laboratorio: l.codLaboratorio, nombre: l.nombreLab }));
        this.cdr.detectChanges();
      }
    });
  }

  cargarAsignaturas(): void {
    this.asignaturaService.listar().subscribe({
      next: (data) => {
        this.asignaturas = data.map(a => ({ id_asignatura: a.idAsignatura || 0, nombre: a.nombre }));
        this.cdr.detectChanges();
      }
    });
  }

  cargarPeriodos(): void {
    this.periodoService.listar().subscribe({
      next: (data) => {
        const activos = data.filter((p: any) =>
          p.estado?.toLowerCase() === 'activo' || p.activo === true || p.activo === 'true'
        );
        this.periodos = activos.map((p: any) => ({ id_periodo: p.idPeriodo || 0, nombre_periodo: p.nombrePeriodo }));
        this.cdr.detectChanges();
      }
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
      }
    });
  }

  onAsignaturaChange(): void {
    const id = this.formularioReserva.id_asignatura;
    if (id) { this.cargarHorariosPorAsignatura(id); } else { this.horariosAcademicos = []; }
  }

  cargarReservasHoy(): void {
    this.asistenciaUsuarioService.listarReservasHoy().subscribe({
      next: (data) => {
        this.reservasHoy = data.map(r => ({
          ...r,
          asistio: r.asistio === true || r.asistio === 'true' ? true
            : r.asistio === false || r.asistio === 'false' ? false : null
        }));
        this.cdr.detectChanges();
      }
    });
  }

  cargarUsuariosBloqueados(): void {
    this.asistenciaUsuarioService.listarBloqueados().subscribe({
      next: (data) => { this.usuariosBloqueados = data; this.cdr.detectChanges(); }
    });
  }

  registrarAsistencia(reserva: any): void {
    this.asistenciaUsuarioService.registrarAsistencia(reserva.idReserva, reserva.idUsuario, undefined).subscribe({
      next: () => { this.mostrarNotificacion('✅ Asistencia registrada'); this.cargarReservasHoy(); this.cdr.detectChanges(); },
      error: () => this.mostrarNotificacion('❌ Error al registrar asistencia', 'error')
    });
  }

  registrarFalta(reserva: any): void {
    this.asistenciaUsuarioService.registrarFalta(reserva.idReserva, reserva.idUsuario).subscribe({
      next: () => {
        this.asistenciaUsuarioService.usuarioBloqueado(reserva.idUsuario).subscribe({
          next: (bloqueado) => {
            this.mostrarNotificacion(
              bloqueado ? `⚠️ Usuario ${reserva.nombreUsuario} bloqueado` : `📋 Falta registrada`,
              bloqueado ? 'error' : 'success'
            );
            this.cargarReservasHoy(); this.cargarUsuariosBloqueados(); this.cdr.detectChanges();
          }
        });
      },
      error: () => this.mostrarNotificacion('❌ Error al registrar falta', 'error')
    });
  }

  desbloquearUsuario(idUsuario: number): void {
    this.asistenciaUsuarioService.desbloquearUsuario(idUsuario).subscribe({
      next: () => { this.mostrarNotificacion('✅ Usuario desbloqueado'); this.cargarUsuariosBloqueados(); this.cdr.detectChanges(); },
      error: () => this.mostrarNotificacion('❌ Error al desbloquear', 'error')
    });
  }

  // ══ PAGINACIÓN RESERVAS ══════════════════════════════════════════════════
  get totalPaginas(): number { return Math.ceil(this.reservasCombinadasFiltradas.length / this.itemsPorPagina); }
  get reservasPaginadas(): any[] {
    const i = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.reservasCombinadasFiltradas.slice(i, i + this.itemsPorPagina);
  }
  get paginas(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }
  cambiarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) { this.paginaActual = p; this.cdr.detectChanges(); }
  }

  // ══ PAGINACIÓN TIPOS ════════════════════════════════════════════════════
  get totalPaginasTipos(): number { return Math.ceil(this.tiposFiltrados.length / this.itemsPorPaginaTipos); }
  get tiposPaginados(): TipoReserva[] {
    const i = (this.paginaActualTipos - 1) * this.itemsPorPaginaTipos;
    return this.tiposFiltrados.slice(i, i + this.itemsPorPaginaTipos);
  }
  get paginasTipos(): number[] { return Array.from({ length: this.totalPaginasTipos }, (_, i) => i + 1); }
  cambiarPaginaTipos(p: number): void {
    if (p >= 1 && p <= this.totalPaginasTipos) { this.paginaActualTipos = p; this.cdr.detectChanges(); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ══ CALENDARIO (prefijo cal_) ════════════════════════════════════════════
  // ══════════════════════════════════════════════════════════════════════════

  cal_dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  cal_vistaActiva = 'Semana';
  cal_horasVisibles: string[] = [];
  cal_HORA_MIN_DEFAULT = 7;
  cal_HORA_MAX_DEFAULT = 18;
  cal_laboratorios: string[] = [];
  cal_coloresLab: Record<string, string> = {};
  cal_reservas: ReservaCalendario[] = [];
  cal_reservaSeleccionada: ReservaCalendario | null = null;
  cal_semanaLabel = '';
  cal_fechaInicioSemana!: Date;
  cal_mesActual!: Date;
  cal_mesLabel = '';
  cal_diasMes: (Date | null)[] = [];
  cal_cargandoDatos = false;
  cal_errorCarga = false;

  cal_mostrarModalConfirm = false;
  cal_confirmData = {
    diaIdx: 0, horaIdx: 0,
    fechaLabel: '', horaInicio: '', horaFin: '', fechaStr: ''
  };

  private cal_getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  cal_calcularSemanaActual(): void {
    const hoy = new Date();
    const dow = hoy.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    this.cal_fechaInicioSemana = new Date(hoy);
    this.cal_fechaInicioSemana.setDate(hoy.getDate() + diff);
    this.cal_actualizarLabelSemana();
  }

  cal_actualizarLabelSemana(): void {
    const fin = this.cal_finDeSemana();
    const fmt = (d: Date) => d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' });
    this.cal_semanaLabel = `${fmt(this.cal_fechaInicioSemana)} – ${fmt(fin)} · ${this.cal_fechaInicioSemana.getFullYear()}`;
  }

  cal_semanaAnterior(): void {
    this.cal_fechaInicioSemana = new Date(this.cal_fechaInicioSemana);
    this.cal_fechaInicioSemana.setDate(this.cal_fechaInicioSemana.getDate() - 7);
    this.cal_actualizarLabelSemana(); this.cal_cargarReservas();
  }

  cal_semanaSiguiente(): void {
    this.cal_fechaInicioSemana = new Date(this.cal_fechaInicioSemana);
    this.cal_fechaInicioSemana.setDate(this.cal_fechaInicioSemana.getDate() + 7);
    this.cal_actualizarLabelSemana(); this.cal_cargarReservas();
  }

  cal_semanaHoy(): void {
    this.cal_reservaSeleccionada = null; this.cal_vistaActiva = 'Semana';
    this.cdr.detectChanges(); this.cal_calcularSemanaActual(); this.cal_cargarReservas();
  }

  cal_mesAnterior(): void {
    this.cal_mesActual = new Date(this.cal_mesActual.getFullYear(), this.cal_mesActual.getMonth() - 1, 1);
    this.cal_actualizarLabelMes(); this.cal_cargarReservasMes();
  }

  cal_mesSiguiente(): void {
    this.cal_mesActual = new Date(this.cal_mesActual.getFullYear(), this.cal_mesActual.getMonth() + 1, 1);
    this.cal_actualizarLabelMes(); this.cal_cargarReservasMes();
  }

  cal_actualizarLabelMes(): void {
    this.cal_mesLabel = this.cal_mesActual.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' });
    this.cal_mesLabel = this.cal_mesLabel.charAt(0).toUpperCase() + this.cal_mesLabel.slice(1);
  }

  cal_construirDiasMes(): void {
    const año = this.cal_mesActual.getFullYear();
    const mes = this.cal_mesActual.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    let startDow = primerDia.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;
    this.cal_diasMes = [];
    for (let i = 0; i < startDow; i++) this.cal_diasMes.push(null);
    for (let d = 1; d <= ultimoDia.getDate(); d++) this.cal_diasMes.push(new Date(año, mes, d));
    while (this.cal_diasMes.length % 7 !== 0) this.cal_diasMes.push(null);
  }

  cal_setVista(v: string): void {
    this.cal_reservaSeleccionada = null; this.cal_vistaActiva = v; this.cdr.detectChanges();
    if (v === 'Mes') {
      this.cal_mesActual = new Date(this.cal_fechaInicioSemana.getFullYear(), this.cal_fechaInicioSemana.getMonth(), 1);
      this.cal_cargarReservasMes();
    } else { this.cal_cargarReservas(); }
  }

  cal_finDeSemana(): Date {
    const fin = new Date(this.cal_fechaInicioSemana);
    fin.setDate(fin.getDate() + 5);
    return fin;
  }

  private cal_formatFecha(d: Date): string {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  cal_cargarReservas(): void {
    this.cal_cargandoDatos = true; this.cal_errorCarga = false;
    const url = `${this.apiUrl}/reservas/semana?inicio=${this.cal_formatFecha(this.cal_fechaInicioSemana)}&fin=${this.cal_formatFecha(this.cal_finDeSemana())}`;
    this.http.get<any[]>(url, { headers: this.cal_getHeaders() }).subscribe({
      next: datos => { this.cal_procesarReservas(datos); this.cal_cargandoDatos = false; this.cdr.detectChanges(); },
      error: () => { this.cal_cargandoDatos = false; this.cal_errorCarga = true; this.cdr.detectChanges(); }
    });
  }

  cal_cargarReservasMes(): void {
    this.cal_cargandoDatos = true; this.cal_errorCarga = false;
    this.cal_actualizarLabelMes(); this.cal_construirDiasMes();
    const año = this.cal_mesActual.getFullYear();
    const mes = this.cal_mesActual.getMonth();
    const inicio = new Date(año, mes, 1);
    const fin = new Date(año, mes + 1, 0);
    this.http.get<any[]>(
      `${this.apiUrl}/reservas/semana?inicio=${this.cal_formatFecha(inicio)}&fin=${this.cal_formatFecha(fin)}`,
      { headers: this.cal_getHeaders() }
    ).subscribe({
      next: datos => { this.cal_procesarReservasMes(datos); this.cal_cargandoDatos = false; this.cdr.detectChanges(); },
      error: () => { this.cal_cargandoDatos = false; this.cal_errorCarga = true; this.cdr.detectChanges(); }
    });
  }

  private cal_asignarColores(activas: any[]): void {
    const labs = new Set<string>(activas.map(r => r.nombreLaboratorio || r.laboratorio || 'Sin lab'));
    this.cal_laboratorios = Array.from(labs);
    this.cal_laboratorios.forEach((lab, i) => {
      if (!this.cal_coloresLab[lab]) { this.cal_coloresLab[lab] = PALETA[i % PALETA.length]; }
    });
  }

  private cal_parseHora(h: string): number {
    if (!h) return this.cal_HORA_MIN_DEFAULT;
    return parseInt(h.toString().split(':')[0], 10);
  }

  private cal_parseMinutos(h: string): number {
    if (!h) return 0;
    return parseInt(h.toString().split(':')[1] || '0', 10);
  }

  private cal_construirHorasVisibles(hMin: number, hMax: number): void {
    this.cal_horasVisibles = [];
    for (let h = hMin; h <= hMax; h++) {
      this.cal_horasVisibles.push(`${h.toString().padStart(2,'0')}:00`);
      if (h < hMax) this.cal_horasVisibles.push(`${h.toString().padStart(2,'0')}:30`);
    }
  }

  private cal_diaIndex(fecha: Date, inicio: Date): number {
    const diff = Math.round(
      (Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) -
        Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate())) / 86_400_000
    );
    return (diff >= 0 && diff <= 5) ? diff : -1;
  }

  private cal_procesarReservas(datos: any[]): void {
    const activas = datos.filter(r => r.estado?.toLowerCase() === 'aprobada');
    this.cal_asignarColores(activas);
    if (activas.length > 0) {
      const hMin = Math.min(...activas.map(r => this.cal_parseHora(r.horaInicio)));
      const hMax = Math.max(...activas.map(r => this.cal_parseHora(r.horaFin)));
      this.cal_construirHorasVisibles(Math.max(0, hMin - 1), Math.min(23, hMax + 1));
    } else {
      this.cal_construirHorasVisibles(this.cal_HORA_MIN_DEFAULT, this.cal_HORA_MAX_DEFAULT);
    }
    this.cal_reservas = activas.map(r => {
      const [anio, mes, dia_r] = r.fechaReserva.split('-').map(Number);
      const fecha = new Date(anio, mes - 1, dia_r);
      const dia = this.cal_diaIndex(fecha, this.cal_fechaInicioSemana);
      if (dia === -1) return null;
      const horaInicioStr = r.horaInicio?.toString().substring(0, 5) || '';
      const horaFinStr    = r.horaFin?.toString().substring(0, 5)    || '';
      const slotBase   = this.cal_parseHora(this.cal_horasVisibles[0]) * 2;
      const slotInicio = this.cal_parseHora(r.horaInicio) * 2 + Math.floor(this.cal_parseMinutos(r.horaInicio) / 30);
      const slotFin    = this.cal_parseHora(r.horaFin)    * 2 + Math.floor(this.cal_parseMinutos(r.horaFin)    / 30);
      const horaInicio = Math.max(0, slotInicio - slotBase);
      const duracion   = Math.max(1, slotFin - slotInicio);
      return {
        id: r.idReserva, laboratorio: r.nombreLaboratorio || r.laboratorio || 'Sin lab',
        dia, horaInicio, duracion,
        titulo: r.nombreAsignatura || r.descripcion || r.motivo || 'Reserva',
        docente: r.nombreUsuario || '', estado: r.estado || '', fecha, horaInicioStr, horaFinStr,
      } as ReservaCalendario;
    }).filter((r): r is ReservaCalendario => r !== null);
  }

  private cal_procesarReservasMes(datos: any[]): void {
    const activas = datos.filter(r => r.estado?.toLowerCase() === 'aprobada');
    this.cal_asignarColores(activas);
    this.cal_reservas = activas.map(r => {
      const [anio, mes, dia_r] = r.fechaReserva.split('-').map(Number);
      return {
        id: r.idReserva, laboratorio: r.nombreLaboratorio || 'Sin lab',
        dia: 0, horaInicio: 0, duracion: 1,
        titulo: r.nombreAsignatura || r.motivo || 'Reserva',
        docente: r.nombreUsuario || '', estado: r.estado || '',
        fecha: new Date(anio, mes - 1, dia_r),
        horaInicioStr: r.horaInicio?.toString().substring(0, 5) || '',
        horaFinStr:    r.horaFin?.toString().substring(0, 5)    || '',
      } as ReservaCalendario;
    });
  }

  cal_getReservasDeCelda(dia: number, horaIdx: number): ReservaCalendario[] {
    return this.cal_reservas.filter(r => r.dia === dia && r.horaInicio === horaIdx);
  }

  cal_getReservasDeDia(fecha: Date | null): ReservaCalendario[] {
    if (!fecha) return [];
    return this.cal_reservas.filter(r =>
      r.fecha.getFullYear() === fecha.getFullYear() &&
      r.fecha.getMonth()    === fecha.getMonth()    &&
      r.fecha.getDate()     === fecha.getDate()
    );
  }

  cal_getAlturaBloque(duracion: number): number { return duracion * 26 - 3; }
  cal_getColorLab(lab: string): string { return this.cal_coloresLab[lab] ?? '#39ff14'; }

  cal_getHoraFin(reserva: ReservaCalendario): string {
    return reserva.horaFinStr
      || this.cal_horasVisibles[Math.min(reserva.horaInicio + Math.ceil(reserva.duracion), this.cal_horasVisibles.length - 1)]
      || '';
  }

  cal_getTopOffset(res: ReservaCalendario): number { return 2; }

  cal_getBadgeEstado(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'aprobada':  return 'badge--aprobada';
      case 'pendiente': return 'badge--pendiente';
      default:          return 'badge--otro';
    }
  }

  cal_esDiaHoy(fecha: Date | null): boolean {
    if (!fecha) return false;
    const hoy = new Date();
    return fecha.getDate() === hoy.getDate() && fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
  }

  cal_seleccionar(reserva: ReservaCalendario): void {
    this.cal_reservaSeleccionada = this.cal_reservaSeleccionada?.id === reserva.id ? null : reserva;
  }

  cal_cerrarDetalle(): void { this.cal_reservaSeleccionada = null; }

  cal_mostrarModalReserva(diaIdx: number, horaIdx: number): void {
    const fecha = new Date(this.cal_fechaInicioSemana);
    fecha.setDate(fecha.getDate() + diaIdx);
    const horaInicio = this.cal_horasVisibles[horaIdx] || '08:00';
    const horaFinNum = Math.min(this.cal_parseHora(horaInicio) + 1, 23);
    const horaFin    = `${horaFinNum.toString().padStart(2, '0')}:00`;
    const fechaLabel = fecha.toLocaleDateString('es-EC', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    this.cal_confirmData = {
      diaIdx, horaIdx,
      fechaLabel: fechaLabel.charAt(0).toUpperCase() + fechaLabel.slice(1),
      horaInicio, horaFin, fechaStr: this.cal_formatFecha(fecha)
    };
    this.cal_mostrarModalConfirm = true;
    this.cdr.detectChanges();
  }

  cal_confirmarYReservar(): void {
    this.cal_mostrarModalConfirm = false;
    this.tabActiva = 1; this.modoEdicion = false; this.tipoModal = 'reserva';
    this.mostrarModal = true; this.resetFormularios(); this.cargarTodosLosHorarios();
    this.formularioReserva.fecha_reserva = this.cal_confirmData.fechaStr;
    this.formularioReserva.hora_inicio   = this.cal_confirmData.horaInicio;
    this.formularioReserva.hora_fin      = this.cal_confirmData.horaFin;
    this.cdr.detectChanges();
  }

  cal_cerrarModalConfirm(): void { this.cal_mostrarModalConfirm = false; this.cdr.detectChanges(); }

  abrirModalCancelarGrupo(grupo: any): void {
    this.itemSeleccionado = grupo;
    this.formularioCancelacion = {
      id_reserva: grupo.idGrupo, id_usuario_cancela: this.idUsuario,
      fecha_cancelacion: new Date().toISOString().split('T')[0], motivo_cancelacion: ''
    };
    this.mostrarModalCancelar = true;
  }

  confirmarCancelacionGrupo(): void {
    if (!this.formularioCancelacion.motivo_cancelacion?.trim()) {
      this.mostrarNotificacion('El motivo de cancelación es obligatorio', 'error'); return;
    }
    const dto = {
      idReserva: this.itemSeleccionado.idGrupo, idUsuarioCancela: this.idUsuario,
      motivoCancelacion: this.formularioCancelacion.motivo_cancelacion
    };
    this.reservaService.cancelarGrupo(this.itemSeleccionado.idGrupo, dto).subscribe({
      next: () => {
        this.cargarReservas(); this.cargarGrupos(); this.cerrarModalCancelar();
        this.mostrarNotificacion('🗑️ Reservas recurrentes canceladas exitosamente');
      },
      error: () => this.mostrarNotificacion('❌ Error al cancelar el grupo', 'error')
    });
  }

  aprobarGrupo(grupo: any): void {
    this.reservaService.aprobarGrupo(grupo.idGrupo).subscribe({
      next: () => { this.cargarReservas(); this.cargarGrupos(); this.mostrarNotificacion('✅ Todas las reservas del grupo aprobadas'); },
      error: () => this.mostrarNotificacion('❌ Error al aprobar el grupo', 'error')
    });
  }

  rechazarGrupo(grupo: any): void {
    this.reservaService.rechazarGrupo(grupo.idGrupo).subscribe({
      next: () => { this.cargarReservas(); this.cargarGrupos(); this.mostrarNotificacion('🚫 Todas las reservas del grupo rechazadas'); },
      error: () => this.mostrarNotificacion('❌ Error al rechazar el grupo', 'error')
    });
  }
}
