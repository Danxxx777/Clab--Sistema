import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Periodo } from '../interfaces/Periodo.model';
import { PeriodoService } from '../services/periodo.service';
import { FacultadService, FacultadDTO } from '../services/facultad.service';
import { CarreraService, CarreraDTO } from '../services/carrera.service';
import { AsignaturaService, AsignaturaDTO } from '../services/asignatura.service';
import { HorarioService, HorarioDTO } from '../services/horario.service';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-academico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './academico.html',
  styleUrls: ['./academico.scss']
})
export class AcademicoComponent implements OnInit {

  tabActiva = 0;
  drawerAbierto = false;
  rol = localStorage.getItem('rol') || '';
  usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';

  periodos: Periodo[] = [];
  facultades: any[] = [];
  carreras: any[] = [];
  asignaturas: any[] = [];
  horarios: any[] = [];

  periodosFiltrado: Periodo[] = [];
  carrerasFiltradas: any[] = [];
  asignaturasFiltradas: any[] = [];
  facultadesFiltradas: any[] = [];
  horariosFiltrados: any[] = [];

  busquedaPeriodos = '';
  busquedaCarreras = '';
  busquedaAsignaturas = '';
  busquedaFacultades = '';
  busquedaHorarios = '';

  mostrarModal = false;
  modoEdicion = false;
  tipoEdicion = '';
  indiceEdicion = -1;

  mostrarToast = false;
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';
  errorModal = '';

  mostrarModalConfirm = false;
  confirmTitulo = 'Confirmar eliminación';
  confirmMensaje = '';
  confirmAccion: (() => void) | null = null;

  // =====================
  // PAGINACIÓN
  // =====================
  itemsPorPagina = 10;

  paginaPeriodos = 1;
  paginaCarreras = 1;
  paginaAsignaturas = 1;
  paginaFacultades = 1;
  paginaHorarios = 1;

  get periodosPaginados(): any[] {
    const i = (this.paginaPeriodos - 1) * this.itemsPorPagina;
    return this.periodosFiltrado.slice(i, i + this.itemsPorPagina);
  }
  get totalPaginasPeriodos(): number {
    return Math.max(1, Math.ceil(this.periodosFiltrado.length / this.itemsPorPagina));
  }
  get paginasArrayPeriodos(): number[] {
    return Array.from({ length: this.totalPaginasPeriodos }, (_, i) => i + 1);
  }

  get carrerasPaginadas(): any[] {
    const i = (this.paginaCarreras - 1) * this.itemsPorPagina;
    return this.carrerasFiltradas.slice(i, i + this.itemsPorPagina);
  }
  get totalPaginasCarreras(): number {
    return Math.max(1, Math.ceil(this.carrerasFiltradas.length / this.itemsPorPagina));
  }
  get paginasArrayCarreras(): number[] {
    return Array.from({ length: this.totalPaginasCarreras }, (_, i) => i + 1);
  }

  get asignaturasPaginadas(): any[] {
    const i = (this.paginaAsignaturas - 1) * this.itemsPorPagina;
    return this.asignaturasFiltradas.slice(i, i + this.itemsPorPagina);
  }
  get totalPaginasAsignaturas(): number {
    return Math.max(1, Math.ceil(this.asignaturasFiltradas.length / this.itemsPorPagina));
  }
  get paginasArrayAsignaturas(): number[] {
    return Array.from({ length: this.totalPaginasAsignaturas }, (_, i) => i + 1);
  }

  get facultadesPaginadas(): any[] {
    const i = (this.paginaFacultades - 1) * this.itemsPorPagina;
    return this.facultadesFiltradas.slice(i, i + this.itemsPorPagina);
  }
  get totalPaginasFacultades(): number {
    return Math.max(1, Math.ceil(this.facultadesFiltradas.length / this.itemsPorPagina));
  }
  get paginasArrayFacultades(): number[] {
    return Array.from({ length: this.totalPaginasFacultades }, (_, i) => i + 1);
  }

  get horariosPaginados(): any[] {
    const i = (this.paginaHorarios - 1) * this.itemsPorPagina;
    return this.horariosFiltrados.slice(i, i + this.itemsPorPagina);
  }
  get totalPaginasHorarios(): number {
    return Math.max(1, Math.ceil(this.horariosFiltrados.length / this.itemsPorPagina));
  }
  get paginasArrayHorarios(): number[] {
    return Array.from({ length: this.totalPaginasHorarios }, (_, i) => i + 1);
  }

  // =====================

  abrirConfirm(nombreItem: string, tipo: string, accion: () => void): void {
    this.confirmMensaje = `Estás a punto de eliminar <strong>${nombreItem}</strong>.`;
    this.confirmAccion = accion;
    this.mostrarModalConfirm = true;
  }

  confirmarEliminar(): void {
    if (this.confirmAccion) this.confirmAccion();
    this.mostrarModalConfirm = false;
    this.confirmAccion = null;
  }

  cancelarConfirm(): void {
    this.mostrarModalConfirm = false;
    this.confirmAccion = null;
  }

  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    this.ngZone.run(() => {
      this.toastMensaje = mensaje;
      this.toastTipo = tipo;
      this.mostrarToast = true;
      this.cdr.detectChanges();
      setTimeout(() => { this.mostrarToast = false; this.cdr.detectChanges(); }, 3000);
    });
  }

  mostrarDetalle = false;
  tipoDetalle = '';
  itemDetalle: any = {};

  formularioPeriodo    = { nombre: '', fechaInicio: '', fechaFin: '', fechaCreacion: '', estado: '' };
  formularioCarrera    = { nombre: '', idFacultad: 0, idCoordinador: 0, estado: 'ACTIVA' };
  formularioAsignatura = { nombre: '', idCarrera: 0, nivel: 1, horasSemanales: 4, requiereLaboratorio: false, estado: 'ACTIVA' };
  formularioFacultad   = { nombre: '', descripcion: '', idDecano: 0, estado: 'ACTIVO' };
  formularioHorario    = { idPeriodo: 0, idAsignatura: 0, idDocente: 0, diaSemana: '', horaInicio: '', horaFin: '', numeroEstudiantes: 30, estado: 'ACTIVO' };

  decanos: any[] = [];
  coordinadores: any[] = [];
  docentes: any[] = [];

  // ── Time Picker ────────────────────────────────────────────────────────────
  timePickerAbierto: 'inicio' | 'fin' | null = null;

  horas: string[] = [
    '07:00','07:30','08:00','08:30','09:00','09:30',
    '10:00','10:30','11:00','11:30','12:00','12:30',
    '13:00','13:30','14:00','14:30','15:00','15:30',
    '16:00','16:30','17:00','17:30','18:00','18:30',
    '19:00','19:30','20:00'
  ];

  toggleTimePicker(cual: 'inicio' | 'fin', event?: MouseEvent): void {
    if (this.timePickerAbierto === cual) {
      this.timePickerAbierto = null;
      return;
    }
    this.timePickerAbierto = cual;
    setTimeout(() => {
      const wrap     = (event?.target as HTMLElement)?.closest('.time-picker-wrap');
      const input    = wrap?.querySelector('.time-display') as HTMLElement;
      const dropdown = wrap?.querySelector('.time-picker-dropdown') as HTMLElement;
      if (input && dropdown) {
        const rect = input.getBoundingClientRect();
        dropdown.style.top   = `${rect.bottom + 4}px`;
        dropdown.style.left  = `${rect.left}px`;
        dropdown.style.width = `${rect.width}px`;
      }
    }, 0);
  }

  selectHora(cual: 'inicio' | 'fin', hora: string): void {
    if (cual === 'inicio') this.formularioHorario.horaInicio = hora;
    else                   this.formularioHorario.horaFin   = hora;
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

  constructor(
    private router: Router,
    private periodo: PeriodoService,
    private facultadService: FacultadService,
    private carreraService: CarreraService,
    private asignaturaService: AsignaturaService,
    private horarioService: HorarioService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.rol = localStorage.getItem('rol') || '';
    this.usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';
    this.cargarPeriodos();
    this.cargarFacultades();
    this.cargarDecanos();
    this.cargarCarreras();
    this.cargarCoordinadores();
    this.cargarAsignaturas();
    this.cargarHorarios();
    this.cargarDocentes();
  }

  cambiarTab(tabIndex: number) { this.tabActiva = tabIndex; }

  getTipoTexto(): string {
    switch(this.tipoEdicion) {
      case 'periodo':    return 'Período Académico';
      case 'carrera':    return 'Carrera';
      case 'asignatura': return 'Asignatura';
      case 'facultad':   return 'Facultad';
      case 'horario':    return 'Horario';
      default: return '';
    }
  }

  filtrarPeriodos(): void {
    const b = this.busquedaPeriodos.toLowerCase();
    this.periodosFiltrado = this.periodos.filter(p => p.estado !== 'ELIMINADO').filter(p =>
      p.nombrePeriodo.toLowerCase().includes(b) || p.estado.toLowerCase().includes(b)
    );
    this.paginaPeriodos = 1;
  }

  filtrarCarreras(): void {
    const b = this.busquedaCarreras.toLowerCase();
    this.carrerasFiltradas = this.carreras.filter(c => c.estado !== 'ELIMINADA').filter(c =>
      c.nombreCarrera.toLowerCase().includes(b) ||
      (c.nombreFacultad && c.nombreFacultad.toLowerCase().includes(b)) ||
      c.estado.toLowerCase().includes(b)
    );
    this.paginaCarreras = 1;
  }

  filtrarAsignaturas(): void {
    const b = this.busquedaAsignaturas.toLowerCase();
    this.asignaturasFiltradas = this.asignaturas.filter(a => a.estado !== 'ELIMINADA').filter(a =>
      a.nombre.toLowerCase().includes(b) ||
      (a.nombreCarrera && a.nombreCarrera.toLowerCase().includes(b)) ||
      a.estado.toLowerCase().includes(b)
    );
    this.paginaAsignaturas = 1;
  }

  filtrarFacultades(): void {
    const b = this.busquedaFacultades.toLowerCase();
    this.facultadesFiltradas = this.facultades.filter(f => f.estado !== 'ELIMINADO').filter(f =>
      f.nombre.toLowerCase().includes(b) ||
      (f.nombreDecano && f.nombreDecano.toLowerCase().includes(b)) ||
      f.estado.toLowerCase().includes(b)
    );
    this.paginaFacultades = 1;
  }

  filtrarHorarios(): void {
    const b = this.busquedaHorarios.toLowerCase();
    this.horariosFiltrados = this.horarios.filter(h => h.estado !== 'ELIMINADO').filter(h =>
      h.nombrePeriodo.toLowerCase().includes(b) ||
      h.nombreAsignatura.toLowerCase().includes(b) ||
      h.nombreDocente.toLowerCase().includes(b) ||
      h.diaSemana.toLowerCase().includes(b)
    );
    this.paginaHorarios = 1;
  }

  cargarPeriodos(): void {
    this.periodo.listar().subscribe({
      next: (data) => {
        this.periodos = data.filter(p => p.estado !== 'ELIMINADO').sort((a, b) => {
          if (a.estado === 'ACTIVO' && b.estado !== 'ACTIVO') return -1;
          if (a.estado !== 'ACTIVO' && b.estado === 'ACTIVO') return 1;
          return (b.idPeriodo ?? 0) - (a.idPeriodo ?? 0);
        });
        this.periodosFiltrado = [...this.periodos];
        this.paginaPeriodos = 1;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar períodos', err)
    });
  }

  cargarFacultades(): void {
    this.facultadService.listar().subscribe({
      next: (data) => {
        this.facultades = data.filter(f => f.estado !== 'ELIMINADO');
        this.facultadesFiltradas = [...this.facultades];
        this.paginaFacultades = 1;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar facultades', err)
    });
  }

  cargarDecanos(): void {
    this.facultadService.listarDecanos().subscribe({
      next: (data) => { this.decanos = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error al cargar decanos', err)
    });
  }

  cargarCarreras(): void {
    this.carreraService.listar().subscribe({
      next: (data) => {
        this.carreras = data.filter(c => c.estado !== 'ELIMINADA');
        this.carrerasFiltradas = [...this.carreras];
        this.paginaCarreras = 1;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar carreras', err)
    });
  }

  cargarCoordinadores(): void {
    this.carreraService.listarCoordinadores().subscribe({
      next: (data) => { this.coordinadores = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error al cargar coordinadores', err)
    });
  }

  cargarAsignaturas(): void {
    this.asignaturaService.listar().subscribe({
      next: (data) => {
        this.asignaturas = data.filter(a => a.estado !== 'ELIMINADA');
        this.asignaturasFiltradas = [...this.asignaturas];
        this.paginaAsignaturas = 1;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar asignaturas', err)
    });
  }

  cargarHorarios(): void {
    this.horarioService.listar().subscribe({
      next: (data) => {
        this.horarios = data.filter(h => h.estado !== 'ELIMINADO');
        this.horariosFiltrados = [...this.horarios];
        this.paginaHorarios = 1;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar horarios', err)
    });
  }

  cargarDocentes(): void {
    this.horarioService.listarDocentes().subscribe({
      next: (data) => { this.docentes = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error al cargar docentes', err)
    });
  }

  agregarNuevo(tabIndex: number) {
    this.modoEdicion = false;
    this.indiceEdicion = -1;
    this.timePickerAbierto = null;
    switch(tabIndex) {
      case 0: this.tipoEdicion = 'periodo'; break;
      case 1: this.tipoEdicion = 'carrera'; break;
      case 2: this.tipoEdicion = 'asignatura'; break;
      case 3: this.tipoEdicion = 'facultad'; break;
      case 4: this.tipoEdicion = 'horario'; break;
    }
    this.limpiarFormularios();
    this.mostrarModal = true;
  }

  editar(item: any, index: number, tipo: string) {
    this.modoEdicion = true;
    this.tipoEdicion = tipo;
    this.indiceEdicion = index;
    this.timePickerAbierto = null;
    switch(tipo) {
      case 'periodo':    this.formularioPeriodo    = { nombre: item.nombrePeriodo, fechaInicio: item.fechaInicio, fechaFin: item.fechaFin, fechaCreacion: item.fechaCreacion, estado: item.estado }; break;
      case 'carrera':    this.formularioCarrera    = { nombre: item.nombreCarrera, idFacultad: item.idFacultad || 0, idCoordinador: item.idCoordinador || 0, estado: item.estado || 'ACTIVA' }; break;
      case 'asignatura': this.formularioAsignatura = { nombre: item.nombre, idCarrera: item.idCarrera || 0, nivel: item.nivel, horasSemanales: item.horasSemanales, requiereLaboratorio: item.requiereLaboratorio, estado: item.estado || 'ACTIVA' }; break;
      case 'facultad':   this.formularioFacultad   = { nombre: item.nombre, descripcion: item.descripcion || '', idDecano: item.idDecano || 0, estado: item.estado }; break;
      case 'horario':
        this.formularioHorario = {
          idPeriodo: item.idPeriodo || 0,
          idAsignatura: item.idAsignatura || 0,
          idDocente: item.idDocente || 0,
          diaSemana: item.diaSemana,
          horaInicio: (item.horaInicio || '').substring(0, 5),
          horaFin:    (item.horaFin    || '').substring(0, 5),
          numeroEstudiantes: item.numeroEstudiantes,
          estado: item.estado || 'ACTIVO'
        };
        break;
    }
    this.mostrarModal = true;
  }

  eliminar(item: any, tipo: string): void {
    let nombre = '';
    switch(tipo) {
      case 'periodo':    nombre = item.nombrePeriodo; break;
      case 'carrera':    nombre = item.nombreCarrera; break;
      case 'asignatura': nombre = item.nombre; break;
      case 'facultad':   nombre = item.nombre; break;
      case 'horario':    nombre = `${item.nombreAsignatura} - ${item.diaSemana}`; break;
    }
    this.abrirConfirm(nombre, tipo, () => {
      switch(tipo) {
        case 'periodo': { const p: Periodo = { ...item, estado: 'ELIMINADO' }; this.periodo.editar(item.idPeriodo, p).subscribe({ next: () => { this.cargarPeriodos(); this.mostrarNotificacion('✅ Período eliminado correctamente'); }, error: () => this.mostrarNotificacion('❌ Error al eliminar período', 'error') }); break; }
        case 'carrera': { const payload: CarreraDTO = { nombre: item.nombreCarrera, idFacultad: item.idFacultad, idCoordinador: item.idCoordinador, estado: 'ELIMINADA' }; this.carreraService.editar(item.idCarrera, payload).subscribe({ next: () => { this.cargarCarreras(); this.mostrarNotificacion('✅ Carrera eliminada correctamente'); }, error: () => this.mostrarNotificacion('❌ Error al eliminar carrera', 'error') }); break; }
        case 'asignatura': { const payload: AsignaturaDTO = { nombre: item.nombre, idCarrera: item.idCarrera, nivel: item.nivel, horasSemanales: item.horasSemanales, requiereLaboratorio: item.requiereLaboratorio, estado: 'ELIMINADA' }; this.asignaturaService.editar(item.idAsignatura, payload).subscribe({ next: () => { this.cargarAsignaturas(); this.mostrarNotificacion('✅ Asignatura eliminada correctamente'); }, error: () => this.mostrarNotificacion('❌ Error al eliminar asignatura', 'error') }); break; }
        case 'facultad': { const payload: FacultadDTO = { nombre: item.nombre, descripcion: item.descripcion || '', idDecano: item.idDecano, estado: 'ELIMINADO' }; this.facultadService.editar(item.idFacultad, payload).subscribe({ next: () => { this.cargarFacultades(); this.mostrarNotificacion('✅ Facultad eliminada correctamente'); }, error: () => this.mostrarNotificacion('❌ Error al eliminar facultad', 'error') }); break; }
        case 'horario': { const payload: HorarioDTO = { idPeriodo: item.idPeriodo, idAsignatura: item.idAsignatura, idDocente: item.idDocente, diaSemana: item.diaSemana, horaInicio: item.horaInicio, horaFin: item.horaFin, numeroEstudiantes: item.numeroEstudiantes, estado: 'ELIMINADO' }; this.horarioService.editar(item.idHorario, payload).subscribe({ next: () => { this.cargarHorarios(); this.mostrarNotificacion('✅ Horario eliminado correctamente'); }, error: () => this.mostrarNotificacion('❌ Error al eliminar horario', 'error') }); break; }
      }
    });
  }

  toggleEstado(item: any, tipo: string): void {
    switch (tipo) {
      case 'periodo': {
        const nuevoEstado = item.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        if (nuevoEstado === 'ACTIVO') {
          const hayActivo = this.periodos.some(x => x.idPeriodo !== item.idPeriodo && x.estado === 'ACTIVO');
          if (hayActivo) {
            const periodoActivo = this.periodos.find(x => x.idPeriodo !== item.idPeriodo && x.estado === 'ACTIVO');
            const fechaFin = periodoActivo?.fechaFin ? new Date(periodoActivo.fechaFin).toLocaleDateString('es-EC') : '?';
            this.mostrarNotificacion(`❌ Ya hay un período activo. Podrás activar este cuando finalice el ${periodoActivo?.nombrePeriodo} (${fechaFin}).`, 'error');
            return;
          }
        }
        const p: Periodo = { ...item, nombrePeriodo: item.nombrePeriodo, estado: nuevoEstado };
        this.periodo.editar(item.idPeriodo, p).subscribe({ next: () => { this.cargarPeriodos(); this.mostrarNotificacion(`✅ Período ${nuevoEstado === 'ACTIVO' ? 'activado' : 'desactivado'}`); }, error: () => this.mostrarNotificacion('❌ Error al cambiar estado', 'error') });
        break;
      }
      case 'carrera': { const nuevoEstado = item.estado === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA'; const payload: CarreraDTO = { nombre: item.nombreCarrera, idFacultad: item.idFacultad, idCoordinador: item.idCoordinador, estado: nuevoEstado }; this.carreraService.editar(item.idCarrera, payload).subscribe({ next: () => { this.cargarCarreras(); this.mostrarNotificacion(`✅ Carrera ${nuevoEstado === 'ACTIVA' ? 'activada' : 'desactivada'}`); }, error: () => this.mostrarNotificacion('❌ Error al cambiar estado', 'error') }); break; }
      case 'asignatura': { const nuevoEstado = item.estado === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA'; const payload: AsignaturaDTO = { nombre: item.nombre, idCarrera: item.idCarrera, nivel: item.nivel, horasSemanales: item.horasSemanales, requiereLaboratorio: item.requiereLaboratorio, estado: nuevoEstado }; this.asignaturaService.editar(item.idAsignatura, payload).subscribe({ next: () => { this.cargarAsignaturas(); this.mostrarNotificacion(`✅ Asignatura ${nuevoEstado === 'ACTIVA' ? 'activada' : 'desactivada'}`); }, error: () => this.mostrarNotificacion('❌ Error al cambiar estado', 'error') }); break; }
      case 'facultad': { const nuevoEstado = item.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'; const payload: FacultadDTO = { nombre: item.nombre, descripcion: item.descripcion || '', idDecano: item.idDecano, estado: nuevoEstado }; this.facultadService.editar(item.idFacultad, payload).subscribe({ next: () => { this.cargarFacultades(); this.mostrarNotificacion(`✅ Facultad ${nuevoEstado === 'ACTIVO' ? 'activada' : 'desactivada'}`); }, error: () => this.mostrarNotificacion('❌ Error al cambiar estado', 'error') }); break; }
      case 'horario': { const nuevoEstado = item.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'; const payload: HorarioDTO = { idPeriodo: item.idPeriodo, idAsignatura: item.idAsignatura, idDocente: item.idDocente, diaSemana: item.diaSemana, horaInicio: item.horaInicio, horaFin: item.horaFin, numeroEstudiantes: item.numeroEstudiantes, estado: nuevoEstado }; this.horarioService.editar(item.idHorario, payload).subscribe({ next: () => { this.cargarHorarios(); this.mostrarNotificacion(`✅ Horario ${nuevoEstado === 'ACTIVO' ? 'activado' : 'desactivado'}`); }, error: () => this.mostrarNotificacion('❌ Error al cambiar estado', 'error') }); break; }
    }
  }

  guardar() {
    if (!this.validarFormulario()) return;
    switch (this.tipoEdicion) {
      case 'periodo': { const p: Periodo = { nombrePeriodo: this.formularioPeriodo.nombre, fechaInicio: this.formularioPeriodo.fechaInicio, fechaFin: this.formularioPeriodo.fechaFin, fechaCreacion: this.formularioPeriodo.fechaCreacion, estado: this.formularioPeriodo.estado }; const id = this.modoEdicion ? this.periodos[this.indiceEdicion]?.idPeriodo : null; if (this.modoEdicion && id) { this.periodo.editar(id, p).subscribe({ next: () => { this.cargarPeriodos(); this.mostrarNotificacion('✅ Período actualizado correctamente'); this.cerrarModal(); }, error: () => this.mostrarNotificacion('❌ Error al actualizar período', 'error') }); } else { const hayActivo = this.periodos.some(x => x.estado === 'ACTIVO'); p.estado = hayActivo ? 'INACTIVO' : 'ACTIVO'; this.periodo.crear(p).subscribe({ next: () => { this.cargarPeriodos(); this.mostrarNotificacion('✅ Período creado correctamente'); this.cerrarModal(); }, error: () => this.mostrarNotificacion('❌ Error al crear período', 'error') }); } return; }
      case 'facultad': { const payload: FacultadDTO = { nombre: this.formularioFacultad.nombre, descripcion: this.formularioFacultad.descripcion, idDecano: this.formularioFacultad.idDecano, estado: this.formularioFacultad.estado }; const id = this.modoEdicion ? this.facultades[this.indiceEdicion]?.idFacultad : null; if (this.modoEdicion && id) { this.facultadService.editar(id, payload).subscribe({ next: () => { this.cargarFacultades(); this.mostrarNotificacion('✅ Facultad actualizada correctamente'); this.cerrarModal(); }, error: () => this.mostrarNotificacion('❌ Error al actualizar facultad', 'error') }); } else { this.facultadService.crear(payload).subscribe({ next: () => { this.cargarFacultades(); this.mostrarNotificacion('✅ Facultad creada correctamente'); this.cerrarModal(); }, error: () => this.mostrarNotificacion('❌ Error al crear facultad', 'error') }); } return; }
      case 'carrera': { const payload: CarreraDTO = { nombre: this.formularioCarrera.nombre, idFacultad: this.formularioCarrera.idFacultad, idCoordinador: this.formularioCarrera.idCoordinador, estado: this.formularioCarrera.estado }; const id = this.modoEdicion ? this.carreras[this.indiceEdicion]?.idCarrera : null; if (this.modoEdicion && id) { this.carreraService.editar(id, payload).subscribe({ next: () => { this.cargarCarreras(); this.mostrarNotificacion('✅ Carrera actualizada correctamente'); this.cerrarModal(); }, error: () => this.mostrarNotificacion('❌ Error al actualizar carrera', 'error') }); } else { this.carreraService.crear(payload).subscribe({ next: () => { this.cargarCarreras(); this.mostrarNotificacion('✅ Carrera creada correctamente'); this.cerrarModal(); }, error: () => this.mostrarNotificacion('❌ Error al crear carrera', 'error') }); } return; }
      case 'asignatura': { const payload: AsignaturaDTO = { nombre: this.formularioAsignatura.nombre, idCarrera: this.formularioAsignatura.idCarrera, nivel: this.formularioAsignatura.nivel, horasSemanales: this.formularioAsignatura.horasSemanales, requiereLaboratorio: this.formularioAsignatura.requiereLaboratorio, estado: this.formularioAsignatura.estado }; const id = this.modoEdicion ? this.asignaturas[this.indiceEdicion]?.idAsignatura : null; if (this.modoEdicion && id) { this.asignaturaService.editar(id, payload).subscribe({ next: () => { this.cargarAsignaturas(); this.mostrarNotificacion('✅ Asignatura actualizada correctamente'); this.cerrarModal(); }, error: () => this.mostrarNotificacion('❌ Error al actualizar asignatura', 'error') }); } else { this.asignaturaService.crear(payload).subscribe({ next: () => { this.cargarAsignaturas(); this.mostrarNotificacion('✅ Asignatura creada correctamente'); this.cerrarModal(); }, error: () => this.mostrarNotificacion('❌ Error al crear asignatura', 'error') }); } return; }
      case 'horario': { const payload: HorarioDTO = { idPeriodo: this.formularioHorario.idPeriodo, idAsignatura: this.formularioHorario.idAsignatura, idDocente: this.formularioHorario.idDocente, diaSemana: this.formularioHorario.diaSemana, horaInicio: this.formularioHorario.horaInicio, horaFin: this.formularioHorario.horaFin, numeroEstudiantes: this.formularioHorario.numeroEstudiantes, estado: this.formularioHorario.estado }; const id = this.modoEdicion ? this.horarios[this.indiceEdicion]?.idHorario : null; if (this.modoEdicion && id) { this.horarioService.editar(id, payload).subscribe({ next: () => { this.cargarHorarios(); this.mostrarNotificacion('✅ Horario actualizado correctamente'); this.cerrarModal(); }, error: () => this.mostrarNotificacion('❌ Error al actualizar horario', 'error') }); } else { this.horarioService.crear(payload).subscribe({ next: () => { this.cargarHorarios(); this.mostrarNotificacion('✅ Horario creado correctamente'); this.cerrarModal(); }, error: () => this.mostrarNotificacion('❌ Error al crear horario', 'error') }); } return; }
    }
  }

  validarFormulario(): boolean {
    this.errorModal = '';
    switch(this.tipoEdicion) {
      case 'periodo':
        if (!this.formularioPeriodo.nombre.trim()) { this.errorModal = 'El nombre del período es requerido.'; return false; }
        if (!this.formularioPeriodo.fechaInicio || !this.formularioPeriodo.fechaFin) { this.errorModal = 'Las fechas de inicio y fin son requeridas.'; return false; }
        if (new Date(this.formularioPeriodo.fechaInicio) >= new Date(this.formularioPeriodo.fechaFin)) { this.errorModal = 'La fecha de inicio debe ser anterior a la fecha de fin.'; return false; }
        break;
      case 'carrera':
        if (!this.formularioCarrera.nombre.trim()) { this.errorModal = 'El nombre de la carrera es requerido.'; return false; }
        if (!this.formularioCarrera.idFacultad || this.formularioCarrera.idFacultad === 0) { this.errorModal = 'La facultad es requerida.'; return false; }
        break;
      case 'asignatura':
        if (!this.formularioAsignatura.nombre.trim()) { this.errorModal = 'El nombre de la asignatura es requerido.'; return false; }
        if (!this.formularioAsignatura.idCarrera || this.formularioAsignatura.idCarrera === 0) { this.errorModal = 'La carrera es requerida.'; return false; }
        if (this.formularioAsignatura.nivel < 1 || this.formularioAsignatura.nivel > 10) { this.errorModal = 'El nivel debe estar entre 1 y 10.'; return false; }
        if (this.formularioAsignatura.horasSemanales < 1 || this.formularioAsignatura.horasSemanales > 20) { this.errorModal = 'Las horas semanales deben estar entre 1 y 20.'; return false; }
        break;
      case 'facultad':
        if (!this.formularioFacultad.nombre.trim()) { this.errorModal = 'El nombre de la facultad es requerido.'; return false; }
        if (!this.formularioFacultad.idDecano || this.formularioFacultad.idDecano === 0) { this.errorModal = 'El decano es requerido.'; return false; }
        break;
      case 'horario':
        if (!this.formularioHorario.idPeriodo || this.formularioHorario.idPeriodo === 0) { this.errorModal = 'El período académico es requerido.'; return false; }
        if (!this.formularioHorario.idAsignatura || this.formularioHorario.idAsignatura === 0) { this.errorModal = 'La asignatura es requerida.'; return false; }
        if (!this.formularioHorario.idDocente || this.formularioHorario.idDocente === 0) { this.errorModal = 'El docente es requerido.'; return false; }
        if (!this.formularioHorario.diaSemana) { this.errorModal = 'El día de la semana es requerido.'; return false; }
        if (!this.formularioHorario.horaInicio || !this.formularioHorario.horaFin) { this.errorModal = 'Las horas de inicio y fin son requeridas.'; return false; }
        if (this.formularioHorario.horaInicio >= this.formularioHorario.horaFin) { this.errorModal = 'La hora de inicio debe ser anterior a la hora de fin.'; return false; }
        break;
    }
    return true;
  }

  cerrarModal() {
    this.timePickerAbierto = null;
    setTimeout(() => { this.mostrarModal = false; this.errorModal = ''; this.limpiarFormularios(); this.cdr.detectChanges(); }, 800);
  }

  limpiarFormularios() {
    this.formularioPeriodo    = { nombre: '', fechaInicio: '', fechaFin: '', fechaCreacion: '', estado: '' };
    this.formularioCarrera    = { nombre: '', idFacultad: 0, idCoordinador: 0, estado: 'ACTIVA' };
    this.formularioAsignatura = { nombre: '', idCarrera: 0, nivel: 1, horasSemanales: 4, requiereLaboratorio: false, estado: 'ACTIVA' };
    this.formularioFacultad   = { nombre: '', descripcion: '', idDecano: 0, estado: 'ACTIVO' };
    this.formularioHorario    = { idPeriodo: 0, idAsignatura: 0, idDocente: 0, diaSemana: '', horaInicio: '', horaFin: '', numeroEstudiantes: 30, estado: 'ACTIVO' };
  }

  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }
  navegar(ruta: string, texto: string): void { this.cerrarDrawer(); this.router.navigate([`/${ruta}`]); }
  goToDashboard() { this.router.navigate(['/dashboard']); }
  logout() { this.router.navigate(['/']); }
}
