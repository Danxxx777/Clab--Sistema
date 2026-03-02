import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservaService } from '../services/reserva.service';
import { LaboratorioService } from '../services/laboratorio.service';
import { AsignaturaService } from '../services/asignatura.service';
import { PeriodoService } from '../services/periodo.service';
import { HorarioService } from '../services/horario.service';
import { TipoReservaService } from '../services/tipo-reserva.service';

export interface SolicitudReserva {
  id?: number;
  cod_laboratorio: number;
  nombre_laboratorio: string;
  id_asignatura: number;
  nombre_asignatura: string;
  id_periodo: number;
  nombre_periodo: string;
  id_horario_academico: number | null;
  id_tipo_reserva: number;
  nombre_tipo: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  cantidadEstudiantes: number | null;
  motivo: string;
  descripcion: string;
  estado: string;
}

@Component({
  selector: 'app-solicitudes-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes-reserva.html',
  styleUrls: ['./solicitudes-reserva.scss']
})
export class SolicitudesReservaComponent implements OnInit {

  constructor(
    private router: Router,
    private reservaService: ReservaService,
    private laboratorioService: LaboratorioService,
    private asignaturaService: AsignaturaService,
    private periodoService: PeriodoService,
    private horarioService: HorarioService,
    private tipoReservaService: TipoReservaService,
    private cdr: ChangeDetectorRef
  ) {}

  usuarioLogueado = '';
  rol = '';
  idUsuario = 0;
  drawerAbierto = false;
  guardando = false;

  mostrarNotificacion = false;
  notificacionTitulo = '';
  notificacionMensaje = '';
  notificacionTipo: 'exito' | 'error' | 'confirmar' = 'exito';
  accionPendiente: (() => void) | null = null;

  mostrarModal = false;
  modoModal: 'crear' | 'ver' = 'crear';

  solicitudes: SolicitudReserva[] = [];
  solicitudesFiltradas: SolicitudReserva[] = [];
  solicitudesPaginadas: SolicitudReserva[] = [];
  filtroEstado = 'Todos';

  solicitudActual: any = this.nuevaSolicitud();

  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 1;

  // Listas para selects
  laboratorios: any[] = [];
  asignaturas: any[] = [];
  periodos: any[] = [];
  horariosAcademicos: any[] = [];
  tipos: any[] = [];

  ngOnInit(): void {
    this.rol = localStorage.getItem('rol') || '';
    this.usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';
    this.idUsuario = parseInt(localStorage.getItem('idUsuario') || '0');

    this.cargarSolicitudes();
    this.cargarLaboratorios();
    this.cargarAsignaturas();
    this.cargarPeriodos();
    this.cargarTipos();
    this.cargarTodosLosHorarios();
  }

  cargarSolicitudes(): void {
    this.reservaService.listarPorUsuario(this.idUsuario).subscribe({
      next: (data: any[]) => {
        this.solicitudes = data.map(r => ({
          id: r.idReserva,
          cod_laboratorio: r.codLaboratorio,
          nombre_laboratorio: r.nombreLaboratorio,
          id_asignatura: r.idAsignatura,
          nombre_asignatura: r.nombreAsignatura || '-',
          id_periodo: r.idPeriodo,
          nombre_periodo: r.nombrePeriodo,
          id_horario_academico: r.idHorarioAcademico,
          id_tipo_reserva: r.idTipoReserva,
          nombre_tipo: r.nombreTipoReserva || '-',
          fecha: r.fechaReserva,
          horaInicio: r.horaInicio,
          horaFin: r.horaFin,
          cantidadEstudiantes: r.numeroEstudiantes,
          motivo: r.motivo,
          descripcion: r.descripcion || '',
          estado: r.estado
        }));
        this.filtrar();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando solicitudes:', err);
        this.mostrarAlerta('Error', 'No se pudieron cargar las solicitudes', 'error');
      }
    });
  }

  cargarLaboratorios(): void {
    this.laboratorioService.listar().subscribe({
      next: (data: any[]) => {
        this.laboratorios = data.map(l => ({
          cod_laboratorio: l.codLaboratorio,
          nombre: l.nombreLab
        }));
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error cargando laboratorios:', err)
    });
  }

  cargarAsignaturas(): void {
    this.asignaturaService.listar().subscribe({
      next: (data: any[]) => {
        this.asignaturas = data.map(a => ({
          id_asignatura: a.idAsignatura || 0,
          nombre: a.nombre
        }));
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error cargando asignaturas:', err)
    });
  }

  cargarPeriodos(): void {
    this.periodoService.listar().subscribe({
      next: (data: any[]) => {
        this.periodos = data.map(p => ({
          id_periodo: p.idPeriodo || 0,
          nombre_periodo: p.nombrePeriodo
        }));
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error cargando periodos:', err)
    });
  }

  cargarTipos(): void {
    this.tipoReservaService.listar().subscribe({
      next: (data: any[]) => {
        this.tipos = data.map(t => ({
          id_tipo_reserva: t.idTipoReserva,
          nombre_tipo: t.nombreTipo
        }));
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error cargando tipos:', err)
    });
  }

  cargarHorariosPorAsignatura(idAsignatura: number): void {
    this.horarioService.listarPorAsignatura(idAsignatura).subscribe({
      next: (data: any[]) => {
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
      error: (err: any) => console.error('Error cargando horarios:', err)
    });
  }

  cargarTodosLosHorarios(): void {
    this.horarioService.listar().subscribe({
      next: (data: any[]) => {
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
      error: (err: any) => console.error('Error cargando horarios:', err)
    });
  }

  onAsignaturaChange(): void {
    const id = this.solicitudActual.id_asignatura;
    if (id) {
      this.cargarHorariosPorAsignatura(id);
    } else {
      this.horariosAcademicos = [];
    }
  }

  onHorarioChange(): void {
    const idHorario = this.solicitudActual.id_horario_academico;
    if (!idHorario) {
      this.solicitudActual.horaInicio = '';
      this.solicitudActual.horaFin = '';
      return;
    }

    const horario = this.horariosAcademicos.find(h => h.id_horario_academico == idHorario); // 👈 == no ===
    if (horario) {
      this.solicitudActual.horaInicio = horario.hora_inicio;
      this.solicitudActual.horaFin = horario.hora_fin;
      this.solicitudActual.id_asignatura = horario.id_asignatura;
      this.cdr.detectChanges();
    }
  }

  filtrar(): void {
    this.solicitudesFiltradas = this.filtroEstado === 'Todos'
      ? [...this.solicitudes]
      : this.solicitudes.filter(s => s.estado === this.filtroEstado);
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  actualizarPaginacion(): void {
    this.totalPaginas = Math.max(1, Math.ceil(this.solicitudesFiltradas.length / this.itemsPorPagina));
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    this.solicitudesPaginadas = this.solicitudesFiltradas.slice(inicio, inicio + this.itemsPorPagina);
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  totalPorEstado(estado: string): number {
    return this.solicitudes.filter(s => s.estado === estado).length;
  }

  abrirModal(): void {
    this.modoModal = 'crear';
    this.solicitudActual = this.nuevaSolicitud();
    this.cargarTodosLosHorarios();
    this.mostrarModal = true;
  }

  verDetalle(s: any): void {
    this.modoModal = 'ver';
    this.solicitudActual = { ...s };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.guardando = false;
    this.cdr.detectChanges();
  }

  guardarSolicitud(): void {
    const s = this.solicitudActual;

    if (!s.cod_laboratorio || !s.id_asignatura || !s.id_periodo ||
      !s.fecha || !s.horaInicio || !s.horaFin ||
      !s.cantidadEstudiantes || !s.motivo?.trim()) {
      this.mostrarAlerta('Campos incompletos', 'Completa todos los campos obligatorios.', 'error');
      return;
    }

    if (s.horaInicio >= s.horaFin) {
      this.mostrarAlerta('Hora inválida', 'La hora de inicio debe ser anterior a la hora de fin.', 'error');
      return;
    }

    this.guardando = true;

    const dto = {
      codLaboratorio: s.cod_laboratorio,
      idUsuario: this.idUsuario,
      idPeriodo: s.id_periodo,
      idHorarioAcademico: s.id_horario_academico || null,
      idAsignatura: s.id_asignatura,
      idTipoReserva: s.id_tipo_reserva || null,
      fechaReserva: s.fecha,
      horaInicio: s.horaInicio,
      horaFin: s.horaFin,
      motivo: s.motivo,
      numeroEstudiantes: s.cantidadEstudiantes,
      descripcion: s.descripcion || ''
    };

    this.reservaService.crear(dto).subscribe({
      next: () => {
        this.cargarSolicitudes();
        this.guardando = false;
        this.cerrarModal();
        this.mostrarAlerta('¡Solicitud enviada!', 'Tu solicitud está pendiente de aprobación.', 'exito');
      },
      error: (err: any) => {
        console.error('Error creando solicitud:', err);
        this.guardando = false;
        this.mostrarAlerta('Error', err.error?.message || 'No se pudo enviar la solicitud.', 'error');
      }
    });
  }

  cancelarSolicitud(s: any): void {
    this.accionPendiente = () => {
      const dto = {
        idReserva: s.id,
        idUsuarioCancela: this.idUsuario,
        motivoCancelacion: 'Cancelado por el docente'
      };
      this.reservaService.cancelar(dto).subscribe({
        next: () => {
          this.cargarSolicitudes();
          this.mostrarAlerta('Solicitud cancelada', 'La solicitud fue cancelada correctamente.', 'exito');
        },
        error: (err: any) => {
          console.error('Error cancelando:', err);
          this.mostrarAlerta('Error', 'No se pudo cancelar la solicitud.', 'error');
        }
      });
    };
    this.mostrarAlerta('¿Cancelar solicitud?', `¿Estás seguro de cancelar la reserva del ${s.nombre_laboratorio}?`, 'confirmar');
  }

  getEstadoClass(estado?: string): string {
    switch (estado?.toLowerCase()) {
      case 'aprobada':  return 'activo';
      case 'rechazada': return 'inactivo';
      case 'cancelada': return 'inactivo';
      case 'pendiente': return 'pendiente';
      default:          return 'pendiente';
    }
  }

  nuevaSolicitud(): any {
    return {
      cod_laboratorio: 0,
      id_asignatura: 0,
      id_periodo: 0,
      id_horario_academico: null,
      id_tipo_reserva: 0,
      fecha: '',
      horaInicio: '',
      horaFin: '',
      cantidadEstudiantes: null,
      motivo: '',
      descripcion: '',
      estado: 'Pendiente'
    };
  }

  mostrarAlerta(titulo: string, mensaje: string, tipo: 'exito' | 'error' | 'confirmar'): void {
    this.notificacionTitulo = titulo;
    this.notificacionMensaje = mensaje;
    this.notificacionTipo = tipo;
    this.mostrarNotificacion = true;
    if (tipo !== 'confirmar') {
      setTimeout(() => {
        this.mostrarNotificacion = false;
        this.cdr.detectChanges();
      }, 3000);
    }
    this.cdr.detectChanges();
  }

  cerrarNotificacion(): void {
    this.mostrarNotificacion = false;
    this.accionPendiente = null;
    this.cdr.detectChanges();
  }

  confirmarAccion(): void {
    this.mostrarNotificacion = false;
    if (this.accionPendiente) {
      this.accionPendiente();
      this.accionPendiente = null;
    }
    this.cdr.detectChanges();
  }

  volver(): void { this.router.navigate(['/dashboard']); }
  navegar(ruta: string): void { this.cerrarDrawer(); this.router.navigate([`/${ruta}`]); }
  logout(): void { localStorage.clear(); this.router.navigate(['/login']); }
  toggleDrawer(): void  { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void  { this.drawerAbierto = false; }
}
