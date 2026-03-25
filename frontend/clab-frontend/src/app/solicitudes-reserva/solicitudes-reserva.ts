import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReservaService } from '../services/reserva.service';
import { LaboratorioService } from '../services/laboratorio.service';
import { AsignaturaService } from '../services/asignatura.service';
import { PeriodoService } from '../services/periodo.service';
import { HorarioService } from '../services/horario.service';
import { TipoReservaService } from '../services/tipo-reserva.service';
import { AsistenciaUsuarioService } from '../services/asistencia-usuario.service';
import { SolicitudReserva } from '../interfaces/SolicitudReserva.model';

@Component({
  selector: 'app-solicitudes-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes-reserva.html',
  styleUrls: ['./solicitudes-reserva.scss']
})
export class SolicitudesReservaComponent implements OnInit {

  private apiUrl = 'http://localhost:8080';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private reservaService: ReservaService,
    private laboratorioService: LaboratorioService,
    private asignaturaService: AsignaturaService,
    private periodoService: PeriodoService,
    private horarioService: HorarioService,
    private tipoReservaService: TipoReservaService,
    private cdr: ChangeDetectorRef,
    private asistenciaUsuarioService: AsistenciaUsuarioService,
    private http: HttpClient
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

  laboratorios: any[] = [];
  asignaturas: any[] = [];
  periodos: any[] = [];
  horariosAcademicos: any[] = [];
  tipos: any[] = [];

  usuarioBloqueado = false;

  // ── Time Picker ────────────────────────────────────────────────────────────
  timePickerAbierto: 'inicio' | 'fin' | null = null;

  horasDisponibles: string[] = [
    '07:00','07:30','08:00','08:30','09:00','09:30',
    '10:00','10:30','11:00','11:30','12:00','12:30',
    '13:00','13:30','14:00','14:30','15:00','15:30',
    '16:00','16:30','17:00','17:30','18:00'
  ];

  toggleTimePicker(cual: 'inicio' | 'fin', event?: MouseEvent): void {
    if (this.timePickerAbierto === cual) {
      this.timePickerAbierto = null;
      return;
    }
    this.timePickerAbierto = cual;
    setTimeout(() => {
      const wrap = (event?.target as HTMLElement)?.closest('.time-picker-wrap');
      const input   = wrap?.querySelector('.time-display') as HTMLElement;
      const dropdown = wrap?.querySelector('.time-picker-dropdown') as HTMLElement;
      if (input && dropdown) {
        const rect = input.getBoundingClientRect();
        dropdown.style.top  = `${rect.bottom + 4}px`;
        dropdown.style.left = `${rect.left}px`;
        dropdown.style.width = `${rect.width}px`;
      }
    }, 0);
  }

  selectHora(cual: 'inicio' | 'fin', hora: string): void {
    if (cual === 'inicio') this.solicitudActual.horaInicio = hora;
    else                   this.solicitudActual.horaFin   = hora;
    this.timePickerAbierto = null;
    this.cdr.detectChanges();
  }

  cerrarTimePickerSiAfuera(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.time-picker-wrap')) {
      this.timePickerAbierto = null;
    }
  }
  // ──────────────────────────────────────────────────────────────────────────

  get tipoSinAsignatura(): boolean {
    const tipo = this.tipos.find(t => t.id_tipo_reserva === Number(this.solicitudActual.id_tipo_reserva));
    if (!tipo) return false;
    return tipo.requiereAsignatura === false || tipo.requiereAsignatura === null;
  }

  onTipoReservaChange(): void {
    if (this.tipoSinAsignatura) {
      this.solicitudActual.id_asignatura = null;
      this.solicitudActual.id_horario_academico = null;
      this.horariosAcademicos = [];
    }
    this.cdr.detectChanges();
  }

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
    this.verificarBloqueoUsuario();

    this.route.queryParams.subscribe(params => {
      const fecha      = params['fecha'];
      const horaInicio = params['horaInicio'];
      const horaFin    = params['horaFin'];

      if (fecha && horaInicio && horaFin) {
        setTimeout(() => {
          this.solicitudActual = {
            ...this.nuevaSolicitud(),
            fecha,
            horaInicio,
            horaFin
          };
          this.modoModal = 'crear';
          this.mostrarModal = true;
          this.cdr.detectChanges();
        }, 600);
      }
    });
  }

  verificarBloqueoUsuario(): void {
    this.asistenciaUsuarioService.usuarioBloqueado(this.idUsuario).subscribe({
      next: (bloqueado) => { this.usuarioBloqueado = bloqueado; this.cdr.detectChanges(); },
      error: (err) => console.error('Error verificando bloqueo:', err)
    });
  }

  // ══ VERIFICAR BLOQUEO DE LABORATORIO ════════════════════════════════════
  verificarBloqueoLab(codLaboratorio: number, fecha: string): Observable<boolean> {
    return this.http.get<any[]>(`${this.apiUrl}/bloqueos`).pipe(
      map(bloqueos => {
        console.log('Bloqueos:', bloqueos);           // ← ver qué llega
        console.log('Lab:', codLaboratorio);           // ← ver el lab
        console.log('Fecha:', fecha);                  // ← ver la fecha
        const fechaReserva = new Date(fecha + 'T00:00:00');
        return bloqueos.some(b => {
          console.log('Comparando:', b.codLaboratorio, b.estado, b.fechaInicio, b.fechaFin);
          if (Number(b.codLaboratorio) !== Number(codLaboratorio)) return false;
          if (b.estado?.toLowerCase() !== 'activo') return false;
          const inicio = new Date(b.fechaInicio + 'T00:00:00');
          const fin    = new Date(b.fechaFin    + 'T00:00:00');
          return fechaReserva >= inicio && fechaReserva <= fin;
        });
      })
    );
  }

  cargarSolicitudes(): void {
    this.reservaService.listarPorUsuario(this.idUsuario).subscribe({
      next: (data: any[]) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        this.solicitudes = data
          .filter(r => {
            if (r.idGrupoReserva) return false;
            const fechaReserva = new Date(r.fechaReserva + 'T00:00:00');
            return fechaReserva >= hoy;
          })
          .map(r => ({
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
        this.laboratorios = data.map(l => ({ cod_laboratorio: l.codLaboratorio, nombre: l.nombreLab }));
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error cargando laboratorios:', err)
    });
  }

  cargarAsignaturas(): void {
    this.asignaturaService.listar().subscribe({
      next: (data: any[]) => {
        this.asignaturas = data.map(a => ({ id_asignatura: a.idAsignatura || 0, nombre: a.nombre }));
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error cargando asignaturas:', err)
    });
  }

  cargarPeriodos(): void {
    this.periodoService.listar().subscribe({
      next: (data: any[]) => {
        this.periodos = data
          .filter(p => p.estado === 'ACTIVO')
          .map(p => ({ id_periodo: p.idPeriodo || 0, nombre_periodo: p.nombrePeriodo }));
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
          nombre_tipo: t.nombreTipo,
          requiereAsignatura: t.requiereAsignatura
        }));
        this.cdr.detectChanges();
      }
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
    if (id) { this.cargarHorariosPorAsignatura(id); } else { this.horariosAcademicos = []; }
  }

  onHorarioChange(): void {
    const idHorario = this.solicitudActual.id_horario_academico;
    const sinHorario = !idHorario || idHorario === 'null' || +idHorario === 0;
    if (sinHorario) {
      this.solicitudActual.id_horario_academico = null;
      this.solicitudActual.horaInicio = '';
      this.solicitudActual.horaFin = '';
      return;
    }
    const horario = this.horariosAcademicos.find(h => h.id_horario_academico == idHorario);
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
    this.timePickerAbierto = null;
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
    this.timePickerAbierto = null;
    this.cdr.detectChanges();
  }

  guardarSolicitud(): void {
    if (this.usuarioBloqueado) {
      this.mostrarAlerta('🔒 Usuario bloqueado', 'Tienes 2 inasistencias consecutivas. No puedes realizar solicitudes de reserva hasta ser desbloqueado.', 'error');
      return;
    }
    const s = this.solicitudActual;

    if (!s.cod_laboratorio || (!this.tipoSinAsignatura && !s.id_asignatura) || !s.id_periodo ||
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
      idAsignatura: this.tipoSinAsignatura ? null : (s.id_asignatura || null),
      idTipoReserva: s.id_tipo_reserva || null,
      fechaReserva: s.fecha,
      horaInicio: s.horaInicio,
      horaFin: s.horaFin,
      motivo: s.motivo,
      numeroEstudiantes: s.cantidadEstudiantes,
      descripcion: s.descripcion || ''
    };

    // Verificar bloqueo antes de crear
    this.verificarBloqueoLab(s.cod_laboratorio, s.fecha).subscribe(estaBloqueado => {
      if (estaBloqueado) {
        this.guardando = false;
        this.mostrarAlerta(
          'Laboratorio bloqueado',
          'El laboratorio está bloqueado en esa fecha y no puede recibir reservas.',
          'error'
        );
        return;
      }

      this.reservaService.crear(dto).subscribe({
        next: () => {
          this.cargarSolicitudes();
          this.guardando = false;
          this.cerrarModal();
          this.mostrarAlerta('¡Solicitud enviada!', 'Tu solicitud está pendiente de aprobación.', 'exito');
        },
        error: (err: any) => {
          console.error('Error completo:', JSON.stringify(err.error));
          console.error('Error creando solicitud:', err);
          this.guardando = false;
          const rawMsg: string = err.error?.mensaje || err.error?.message || err.error?.error || err.message || '';
          const fullMsg = JSON.stringify(err.error || '').toLowerCase();
          let mensajeUsuario = 'No se pudo enviar la solicitud.';
          if (rawMsg.toLowerCase().includes('ya está reservado') || fullMsg.includes('ya está reservado') || fullMsg.includes('ya esta reservado')) {
            mensajeUsuario = '❌ Este laboratorio ya está reservado en ese horario. Elige otro horario.';
          } else if (rawMsg.toLowerCase().includes('bloqueado') || fullMsg.includes('bloqueado')) {
            mensajeUsuario = '❌ El laboratorio está bloqueado en esa fecha.';
          } else if (rawMsg) {
            mensajeUsuario = '❌ ' + rawMsg;
          }
          this.mostrarAlerta('No se pudo reservar', mensajeUsuario, 'error');
        }
      });
    });
  }

  cancelarSolicitud(s: any): void {
    this.accionPendiente = () => {
      const dto = { idReserva: s.id, idUsuarioCancela: this.idUsuario, motivoCancelacion: 'Cancelado por el docente' };
      this.reservaService.cancelar(dto).subscribe({
        next: () => { this.cargarSolicitudes(); this.mostrarAlerta('Solicitud cancelada', 'La solicitud fue cancelada correctamente.', 'exito'); },
        error: (err: any) => { console.error('Error cancelando:', err); this.mostrarAlerta('Error', 'No se pudo cancelar la solicitud.', 'error'); }
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
      cod_laboratorio: 0, id_asignatura: 0, id_periodo: 0,
      id_horario_academico: null, id_tipo_reserva: 0,
      fecha: '', horaInicio: '', horaFin: '',
      cantidadEstudiantes: null, motivo: '', descripcion: '', estado: 'Pendiente'
    };
  }

  mostrarAlerta(titulo: string, mensaje: string, tipo: 'exito' | 'error' | 'confirmar'): void {
    this.notificacionTitulo = titulo;
    this.notificacionMensaje = mensaje;
    this.notificacionTipo = tipo;
    this.mostrarNotificacion = true;
    if (tipo !== 'confirmar') {
      setTimeout(() => { this.mostrarNotificacion = false; this.cdr.detectChanges(); }, 3000);
    }
    this.cdr.detectChanges();
  }

  cerrarNotificacion(): void { this.mostrarNotificacion = false; this.accionPendiente = null; this.cdr.detectChanges(); }

  confirmarAccion(): void {
    this.mostrarNotificacion = false;
    if (this.accionPendiente) { this.accionPendiente(); this.accionPendiente = null; }
    this.cdr.detectChanges();
  }

  volver(): void { this.router.navigate(['/dashboard']); }
  navegar(ruta: string): void { this.cerrarDrawer(); this.router.navigate([`/${ruta}`]); }
  logout(): void { localStorage.clear(); this.router.navigate(['/login']); }
  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }
}
