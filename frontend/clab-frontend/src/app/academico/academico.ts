import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Periodo} from '../interfaces/Periodo.model';
import { PeriodoService } from '../services/periodo.service';
import {FacultadService, FacultadDTO} from '../services/facultad.service';
import { CarreraService, CarreraDTO } from '../services/carrera.service';
import { AsignaturaService, AsignaturaDTO } from '../services/asignatura.service';
import { HorarioService, HorarioDTO } from '../services/horario.service';

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

  carreras: any [] = [];

  asignaturas: any [] = [];

  horarios: any[]= [];


  periodosFiltrado: Periodo[] = [];
  carrerasFiltradas: any[] = [];
  asignaturasFiltradas: any[]= [];
  facultadesFiltradas: any[] = [];
  horariosFiltrados: any[]= [];


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

  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.mostrarToast = true;

    setTimeout(() => {
      this.mostrarToast = false;
      this.cdr.detectChanges();
    }, 2000);
  }


  mostrarDetalle = false;
  tipoDetalle = '';
  itemDetalle: any = {};


  formularioPeriodo = {
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    fechaCreacion: '',
    estado: ''
  };

  formularioCarrera = {
    nombre: '',
    idFacultad: 0,
    idCoordinador: 0,
    estado: 'ACTIVA'
  };

  formularioAsignatura = {
    nombre: '',
    idCarrera: 0,
    nivel: 1,
    horasSemanales: 4,
    requiereLaboratorio: false,
    estado: 'ACTIVA'
  };

  formularioFacultad = {
    nombre: '',
    descripcion: '',
    idDecano: 0,
    estado: 'ACTIVO'
  };

  formularioHorario = {
    idPeriodo: 0,
    idAsignatura: 0,
    idDocente: 0,
    diaSemana: '',
    horaInicio: '',
    horaFin: '',
    numeroEstudiantes: 30,
    estado: 'ACTIVO'
  };


  decanos: any[]= [];
  coordinadores: any[]= [];

  docentes: any[]= [];

  horas = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00'
  ];

  constructor(private router: Router,
              private periodo: PeriodoService,
              private facultadService: FacultadService,
              private carreraService: CarreraService,
              private asignaturaService: AsignaturaService,
              private horarioService: HorarioService,
              private cdr: ChangeDetectorRef) {}

  cargarPeriodos(): void {
    this.periodo.listar().subscribe({
      next: (data) => {
        this.periodos = data;
        this.periodosFiltrado = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar períodos', err);
      }
    });
  }

  ngOnInit(): void {
    this.rol = localStorage.getItem('rol') || '';
    this.usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';
    console.log('Módulo Académico cargado');
    this.cargarPeriodos();
    this.cargarFacultades();
    this.cargarDecanos();
    this.cargarCarreras();
    this.cargarCoordinadores();
    this.cargarAsignaturas();
    this.cargarHorarios();
    this.cargarDocentes();
  }

  cambiarTab(tabIndex: number) {
    this.tabActiva = tabIndex;
  }

  getTextoBoton(): string {
    switch(this.tabActiva) {
      case 0: return 'Período';
      case 1: return 'Carrera';
      case 2: return 'Asignatura';
      case 3: return 'Facultad';
      case 4: return 'Horario';
      default: return '';
    }
  }

  getTipoTexto(): string {
    switch(this.tipoEdicion) {
      case 'periodo': return 'Período Académico';
      case 'carrera': return 'Carrera';
      case 'asignatura': return 'Asignatura';
      case 'facultad': return 'Facultad';
      case 'horario': return 'Horario';
      default: return '';
    }
  }
  filtrarPeriodos(): void {
    const busqueda = this.busquedaPeriodos.toLowerCase();
    this.periodosFiltrado = this.periodos.filter(periodo =>
      periodo.nombrePeriodo.toLowerCase().includes(busqueda) ||
      periodo.estado.toLowerCase().includes(busqueda)
    );
  }
  filtrarCarreras(): void {
    const busqueda = this.busquedaCarreras.toLowerCase();
    this.carrerasFiltradas = this.carreras.filter(c =>
      c.nombreCarrera.toLowerCase().includes(busqueda) ||
      (c.nombreFacultad && c.nombreFacultad.toLowerCase().includes(busqueda)) ||
      c.estado.toLowerCase().includes(busqueda)
    );
  }
  filtrarAsignaturas(): void {
    const busqueda = this.busquedaAsignaturas.toLowerCase();
    this.asignaturasFiltradas = this.asignaturas.filter(a =>
      a.nombre.toLowerCase().includes(busqueda) ||
      (a.nombreCarrera && a.nombreCarrera.toLowerCase().includes(busqueda)) ||
      a.estado.toLowerCase().includes(busqueda)
    );
  }
  filtrarFacultades(): void {
    const busqueda = this.busquedaFacultades.toLowerCase();
    this.facultadesFiltradas = this.facultades.filter(f =>
      f.nombre.toLowerCase().includes(busqueda) ||
      (f.nombreDecano && f.nombreDecano.toLowerCase().includes(busqueda)) ||
      f.estado.toLowerCase().includes(busqueda)
    );
  }
  filtrarHorarios(): void {
    const busqueda = this.busquedaHorarios.toLowerCase();
    this.horariosFiltrados = this.horarios.filter(h =>
      h.nombrePeriodo.toLowerCase().includes(busqueda) ||
      h.nombreAsignatura.toLowerCase().includes(busqueda) ||
      h.nombreDocente.toLowerCase().includes(busqueda) ||
      h.diaSemana.toLowerCase().includes(busqueda)
    );
  }
  cargarFacultades(): void {
    this.facultadService.listar().subscribe({
      next: (data) => {
        this.facultades = data;
        this.facultadesFiltradas = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar facultades', err)
    });
  }
  cargarDecanos(): void {
    this.facultadService.listarDecanos().subscribe({
      next: (data) => {
        this.decanos = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar decanos', err)
    });
  }
  cargarCarreras(): void {
    this.carreraService.listar().subscribe({
      next: (data) => {
        this.carreras = data;
        this.carrerasFiltradas = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar carreras', err)
    });
  }
  cargarCoordinadores(): void {
    this.carreraService.listarCoordinadores().subscribe({
      next: (data) => {
        this.coordinadores = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar coordinadores', err)
    });
  }
  cargarAsignaturas(): void {
    this.asignaturaService.listar().subscribe({
      next: (data) => {
        this.asignaturas = data;
        this.asignaturasFiltradas = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar asignaturas', err)
    });
  }
  cargarHorarios(): void {
    this.horarioService.listar().subscribe({
      next: (data) => {
        this.horarios = data;
        this.horariosFiltrados = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar horarios', err)
    });
  }
  cargarDocentes(): void {
    this.horarioService.listarDocentes().subscribe({
      next: (data) => {
        this.docentes = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar docentes', err)
    });
  }
  agregarNuevo(tabIndex: number) {
    this.modoEdicion = false;
    this.indiceEdicion = -1;

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

  verDetalle(item: any, tipo: string) {
    this.itemDetalle = { ...item };
    this.tipoDetalle = tipo;
    this.mostrarDetalle = true;
  }

  cerrarDetalle() {
    this.mostrarDetalle = false;
    this.itemDetalle = {};
    this.tipoDetalle = '';
  }

  editar(item: any, index: number, tipo: string) {
    this.modoEdicion = true;
    this.tipoEdicion = tipo;
    this.indiceEdicion = index;

    switch(tipo) {
      case 'periodo':
        this.formularioPeriodo = {
          nombre: item.nombrePeriodo,
          fechaInicio: item.fechaInicio,
          fechaFin: item.fechaFin,
          fechaCreacion: item.fechaCreacion,
          estado: item.estado
        };
        break;
      case 'carrera':
        this.formularioCarrera = {
          nombre: item.nombreCarrera,
          idFacultad: item.idFacultad || 0,
          idCoordinador: item.idCoordinador || 0,
          estado: item.estado || 'ACTIVA'
        };
        break;
      case 'asignatura':
        this.formularioAsignatura = {
          nombre: item.nombre,
          idCarrera: item.idCarrera || 0,
          nivel: item.nivel,
          horasSemanales: item.horasSemanales,
          requiereLaboratorio: item.requiereLaboratorio,
          estado: item.estado || 'ACTIVA'
        };
        break;
      case 'facultad':
        this.formularioFacultad = {
          nombre: item.nombre,
          descripcion: item.descripcion || '',
          idDecano: item.idDecano || 0,
          estado: item.estado
        };
        break;
      case 'horario':
        this.formularioHorario = {
          idPeriodo: item.idPeriodo || 0,
          idAsignatura: item.idAsignatura || 0,
          idDocente: item.idDocente || 0,
          diaSemana: item.diaSemana,
          horaInicio: item.horaInicio,
          horaFin: item.horaFin,
          numeroEstudiantes: item.numeroEstudiantes,
          estado: item.estado || 'ACTIVO'
        };
        break;
    }

    this.mostrarModal = true;
  }

  eliminar(item: any, index: number, tipo: string) {
    const confirmacion = confirm(`¿Está seguro que desea eliminar este ${tipo}?\n\n${item.nombre || item.asignatura}`);

    if (confirmacion) {
      switch(tipo) {
        case 'periodo':
          this.periodo.eliminar(item.idPeriodo).subscribe({
            next: () => {
              this.periodos.splice(index, 1);
              this.filtrarPeriodos();
              this.cdr.detectChanges();
              this.mostrarNotificacion('Período eliminado correctamente');
            }
          });
          break;
        case 'carrera':
          this.carreraService.eliminar(item.idCarrera).subscribe({
            next: () => {
              this.cargarCarreras();
              this.mostrarNotificacion('Carrera eliminada correctamente');
            },
            error: () => this.mostrarNotificacion('Error al eliminar carrera', 'error')
          });
          break;
        case 'asignatura':
          this.asignaturaService.eliminar(item.idAsignatura).subscribe({
            next: () => {
              this.cargarAsignaturas();
              this.mostrarNotificacion('Asignatura eliminada correctamente');
            },
            error: () => this.mostrarNotificacion('Error al eliminar asignatura', 'error')
          });
          break;
        case 'facultad':
          this.facultadService.eliminar(item.idFacultad).subscribe({
            next: () => {
              this.cargarFacultades();
              this.mostrarNotificacion('Facultad eliminada correctamente');
            },
            error: () => {
              this.mostrarNotificacion('Error al eliminar facultad', 'error');
            }
          });
          break;
        case 'horario':
          this.horarioService.eliminar(item.idHorario).subscribe({
            next: () => {
              this.cargarHorarios();
              this.mostrarNotificacion('Horario eliminado correctamente');
            },
            error: () => this.mostrarNotificacion('Error al eliminar horario', 'error')
          });
          break;
      }
    }
  }
  guardar() {
    if (!this.validarFormulario()) return;
    switch (this.tipoEdicion) {
      case 'periodo': {
        const periodo: Periodo = {
          nombrePeriodo: this.formularioPeriodo.nombre,
          fechaInicio: this.formularioPeriodo.fechaInicio,
          fechaFin: this.formularioPeriodo.fechaFin,
          fechaCreacion: this.formularioPeriodo.fechaCreacion,
          estado: this.formularioPeriodo.estado
        };
        const id = this.modoEdicion ? this.periodos[this.indiceEdicion]?.idPeriodo : null;
        if (this.modoEdicion && id) {
          this.periodo.editar(id, periodo).subscribe({
            next: (periodoActualizado) => {
              this.periodos[this.indiceEdicion] = periodoActualizado;
              this.periodosFiltrado = [...this.periodos];
              this.cdr.detectChanges();
              this.cerrarModal();
              this.mostrarNotificacion('Período actualizado');
            },
            error: () => this.mostrarNotificacion('Error al actualizar período', 'error')
          });
        } else {
          const hayPeriodoActivo = this.periodos.some(p => p.estado === 'ACTIVO');
          if (hayPeriodoActivo) {
            periodo.estado = 'INACTIVO';
          } else {
            periodo.estado = 'ACTIVO';
          }
          this.periodo.crear(periodo).subscribe({
            next: (periodoCreado) => {
              this.periodos.push(periodoCreado);
              this.periodosFiltrado = [...this.periodos];
              this.cdr.detectChanges();
              this.cerrarModal();
              this.mostrarNotificacion('Período creado');
            },
            error: () => this.mostrarNotificacion('Error al crear período', 'error')
          });
        }
        return;
      }
      case 'facultad': {
        const payload: FacultadDTO = {
          nombre: this.formularioFacultad.nombre,
          descripcion: this.formularioFacultad.descripcion,
          idDecano: this.formularioFacultad.idDecano,
          estado: this.formularioFacultad.estado
        };
        const id = this.modoEdicion
          ? this.facultades[this.indiceEdicion]?.idFacultad
          : null;
        if (this.modoEdicion && id) {

          this.facultadService.editar(id, payload).subscribe({
            next: () => {
              this.cargarFacultades();
              this.cerrarModal();
              this.mostrarNotificacion('Facultad actualizada correctamente');
            },
            error: () => {
              this.mostrarNotificacion('Error al actualizar facultad', 'error');
            }
          });
        } else {

          this.facultadService.crear(payload).subscribe({
            next: () => {
              this.cargarFacultades();
              this.cerrarModal();
              this.mostrarNotificacion('Facultad creada correctamente');
            },
            error: () => {
              this.mostrarNotificacion('Error al crear facultad', 'error');
            }
          });
        }
        return;
      }
      case 'carrera': {
        const payload: CarreraDTO = {
          nombre: this.formularioCarrera.nombre,
          idFacultad: this.formularioCarrera.idFacultad,
          idCoordinador: this.formularioCarrera.idCoordinador,
          estado: this.formularioCarrera.estado
        };
        const id = this.modoEdicion ? this.carreras[this.indiceEdicion]?.idCarrera : null;

        if (this.modoEdicion && id) {
          this.carreraService.editar(id, payload).subscribe({
            next: () => {
              this.cargarCarreras();
              this.cerrarModal();
              this.mostrarNotificacion('Carrera actualizada correctamente');
            },
            error: () => this.mostrarNotificacion('Error al actualizar carrera', 'error')
          });
        } else {
          this.carreraService.crear(payload).subscribe({
            next: () => {
              this.cargarCarreras();
              this.cerrarModal();
              this.mostrarNotificacion('Carrera creada correctamente');
            },
            error: () => this.mostrarNotificacion('Error al crear carrera', 'error')
          });
        }
        return;
      }

      case 'asignatura': {
        const payload: AsignaturaDTO = {
          nombre: this.formularioAsignatura.nombre,
          idCarrera: this.formularioAsignatura.idCarrera,
          nivel: this.formularioAsignatura.nivel,
          horasSemanales: this.formularioAsignatura.horasSemanales,
          requiereLaboratorio: this.formularioAsignatura.requiereLaboratorio,
          estado: this.formularioAsignatura.estado
        };

        const id = this.modoEdicion ? this.asignaturas[this.indiceEdicion]?.idAsignatura : null;

        if (this.modoEdicion && id) {
          this.asignaturaService.editar(id, payload).subscribe({
            next: () => {
              this.cargarAsignaturas();
              this.cerrarModal();
              this.mostrarNotificacion('Asignatura actualizada correctamente');
            },
            error: () => this.mostrarNotificacion('Error al actualizar asignatura', 'error')
          });
        } else {
          this.asignaturaService.crear(payload).subscribe({
            next: () => {
              this.cargarAsignaturas();
              this.cerrarModal();
              this.mostrarNotificacion('Asignatura creada correctamente');
            },
            error: () => this.mostrarNotificacion('Error al crear asignatura', 'error')
          });
        }
        return;
      }

      case 'horario': {
        const payload: HorarioDTO = {
          idPeriodo: this.formularioHorario.idPeriodo,
          idAsignatura: this.formularioHorario.idAsignatura,
          idDocente: this.formularioHorario.idDocente,
          diaSemana: this.formularioHorario.diaSemana,
          horaInicio: this.formularioHorario.horaInicio,
          horaFin: this.formularioHorario.horaFin,
          numeroEstudiantes: this.formularioHorario.numeroEstudiantes,
          estado: this.formularioHorario.estado
        };

        const id = this.modoEdicion ? this.horarios[this.indiceEdicion]?.idHorario : null;

        if (this.modoEdicion && id) {
          this.horarioService.editar(id, payload).subscribe({
            next: () => {
              this.cargarHorarios();
              this.cerrarModal();
              this.mostrarNotificacion('Horario actualizado correctamente');
            },
            error: () => this.mostrarNotificacion('Error al actualizar horario', 'error')
          });
        } else {
          this.horarioService.crear(payload).subscribe({
            next: () => {
              this.cargarHorarios();
              this.cerrarModal();
              this.mostrarNotificacion('Horario creado correctamente');
            },
            error: () => this.mostrarNotificacion('Error al crear horario', 'error')
          });
        }
        return;
      }
    }
  }

  validarFormulario(): boolean {
    switch(this.tipoEdicion) {
      case 'periodo':
        if (!this.formularioPeriodo.nombre.trim()) {
          alert('El nombre del período es requerido');
          return false;
        }
        if (!this.formularioPeriodo.fechaInicio || !this.formularioPeriodo.fechaFin) {
          alert('Las fechas son requeridas');
          return false;
        }
        if (new Date(this.formularioPeriodo.fechaInicio) >= new Date(this.formularioPeriodo.fechaFin)) {
          alert('La fecha de inicio debe ser anterior a la fecha de fin.');
          return false;
        }
        break;

      case 'carrera':
        if (!this.formularioCarrera.nombre.trim()) {
          alert('El nombre de la carrera es requerido');
          return false;
        }
        if (!this.formularioCarrera.idFacultad || this.formularioCarrera.idFacultad === 0) {
          alert('La facultad es requerida');
          return false;
        }
        break;

      case 'asignatura':
        if (!this.formularioAsignatura.nombre.trim()) {
          alert('El nombre de la asignatura es requerido');
          return false;
        }
        if (!this.formularioAsignatura.idCarrera || this.formularioAsignatura.idCarrera === 0) {
          alert('La carrera es requerida');
          return false;
        }
        if (this.formularioAsignatura.nivel < 1 || this.formularioAsignatura.nivel > 10) {
          alert('El nivel debe estar entre 1 y 10');
          return false;
        }
        if (this.formularioAsignatura.horasSemanales < 1 || this.formularioAsignatura.horasSemanales > 20) {
          alert('Las horas semanales deben estar entre 1 y 20');
          return false;
        }
        break;

      case 'facultad':
        if (!this.formularioFacultad.nombre.trim()) {
          alert('El nombre de la facultad es requerido');
          return false;
        }
        if (!this.formularioFacultad.idDecano || this.formularioFacultad.idDecano === 0) {
          alert('El decano es requerido');
          return false;
        }
        break;

      case 'horario':
        if (!this.formularioHorario.idPeriodo || this.formularioHorario.idPeriodo === 0) {
          alert('El período académico es requerido');
          return false;
        }
        if (!this.formularioHorario.idAsignatura || this.formularioHorario.idAsignatura === 0) {
          alert('La asignatura es requerida');
          return false;
        }
        if (!this.formularioHorario.idDocente || this.formularioHorario.idDocente === 0) {
          alert('El docente es requerido');
          return false;
        }
        if (!this.formularioHorario.diaSemana) {
          alert('El día de la semana es requerido');
          return false;
        }
        if (!this.formularioHorario.horaInicio || !this.formularioHorario.horaFin) {
          alert('Las horas son requeridas');
          return false;
        }
        if (this.formularioHorario.horaInicio >= this.formularioHorario.horaFin) {
          alert('La hora de inicio debe ser anterior a la hora de fin');
          return false;
        }
        break;
    }
    return true;
  }
  cerrarModal() {
    this.mostrarModal = false;
    this.limpiarFormularios();
  }
  limpiarFormularios() {
    this.formularioPeriodo = {
      nombre: '',
      fechaInicio: '',
      fechaFin: '',
      fechaCreacion: '',
      estado: ''
    };

    this.formularioCarrera = {
      nombre: '',
      idFacultad: 0,
      idCoordinador: 0,
      estado: 'ACTIVA'
    };

    this.formularioAsignatura = {
      nombre: '',
      idCarrera: 0,
      nivel: 1,
      horasSemanales: 4,
      requiereLaboratorio: false,
      estado: 'ACTIVA'
    };

    this.formularioFacultad = {
      nombre: '',
      descripcion: '',
      idDecano: 0,
      estado: 'ACTIVO'
    };

    this.formularioHorario = {
      idPeriodo: 0,
      idAsignatura: 0,
      idDocente: 0,
      diaSemana: '',
      horaInicio: '',
      horaFin: '',
      numeroEstudiantes: 30,
      estado: 'ACTIVO'
    };
  }
  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }

  navegar(ruta: string, texto: string): void {
    this.cerrarDrawer();
    this.router.navigate([`/${ruta}`]);
  }
  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.router.navigate(['/']);
  }
}
