import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Periodo} from '../interfaces/Periodo.model';
import { PeriodoService } from '../services/periodo.service';


@Component({
  selector: 'app-academico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './academico.html',
  styleUrls: ['./academico.scss']
})
export class AcademicoComponent implements OnInit {

  tabActiva = 0;


  periodos: Periodo[] = [];

  facultadesData = [
    { nombre: 'Facultad de Ingeniería', descripcion: 'Formación de profesionales en ingeniería con excelencia académica', decano: 'Dr. Carlos Rodríguez', fechaCreacion: '1995-03-15', estado: 'ACTIVO' },
    { nombre: 'Facultad de Ciencias Médicas', descripcion: 'Educación médica de vanguardia y formación humanística', decano: 'Dra. Laura Fernández', fechaCreacion: '1980-09-20', estado: 'ACTIVO' },
    { nombre: 'Facultad de Ciencias Económicas', descripcion: 'Líderes en administración y economía', decano: 'Lic. Pedro Gómez', fechaCreacion: '1992-06-10', estado: 'ACTIVO' },
    { nombre: 'Facultad de Ciencias Jurídicas', descripcion: 'Formación integral en derecho y ciencias jurídicas', decano: 'Dr. Roberto Sánchez', fechaCreacion: '1988-11-05', estado: 'INACTIVO' },
    { nombre: 'Facultad de Ciencias Sociales', descripcion: 'Estudio del comportamiento humano y social', decano: 'PhD. Julia Méndez', fechaCreacion: '2000-02-18', estado: 'ACTIVO' }
  ];

  carreras = [
    { nombre: 'Ingeniería de Sistemas', facultad: 'Facultad de Ingeniería', estado: 'ACTIVA' },
    { nombre: 'Medicina', facultad: 'Facultad de Ciencias Médicas', estado: 'ACTIVA' },
    { nombre: 'Administración de Empresas', facultad: 'Facultad de Ciencias Económicas', estado: 'ACTIVA' },
    { nombre: 'Derecho', facultad: 'Facultad de Ciencias Jurídicas', estado: 'INACTIVA' },
    { nombre: 'Psicología', facultad: 'Facultad de Ciencias Sociales', estado: 'ACTIVA' }
  ];

  asignaturas = [
    { nombre: 'Programación I', carrera: 'Ingeniería de Sistemas', nivel: 1, horasSemanales: 6, requiereLaboratorio: 'SI', estado: 'ACTIVA' },
    { nombre: 'Base de Datos', carrera: 'Ingeniería de Sistemas', nivel: 3, horasSemanales: 6, requiereLaboratorio: 'SI', estado: 'ACTIVA' },
    { nombre: 'Anatomía Humana', carrera: 'Medicina', nivel: 2, horasSemanales: 8, requiereLaboratorio: 'SI', estado: 'ACTIVA' },
    { nombre: 'Contabilidad General', carrera: 'Administración de Empresas', nivel: 1, horasSemanales: 4, requiereLaboratorio: 'NO', estado: 'ACTIVA' },
    { nombre: 'Derecho Civil', carrera: 'Derecho', nivel: 1, horasSemanales: 5, requiereLaboratorio: 'NO', estado: 'INACTIVA' }
  ];

  horarios = [
    { periodo: '2024-I', asignatura: 'Programación I', docente: 'Dr. Carlos Rodríguez', diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '10:00', numeroEstudiantes: 35 },
    { periodo: '2024-I', asignatura: 'Base de Datos', docente: 'Ing. Ana Martínez', diaSemana: 'MIÉRCOLES', horaInicio: '10:00', horaFin: '12:00', numeroEstudiantes: 28 },
    { periodo: '2024-I', asignatura: 'Anatomía Humana', docente: 'Dra. Laura Fernández', diaSemana: 'VIERNES', horaInicio: '14:00', horaFin: '16:00', numeroEstudiantes: 45 },
    { periodo: '2024-II', asignatura: 'Contabilidad General', docente: 'Lic. Pedro Gómez', diaSemana: 'MARTES', horaInicio: '16:00', horaFin: '18:00', numeroEstudiantes: 32 }
  ];


  periodosFiltrado: Periodo[] = [];
  carrerasFiltradas = [...this.carreras];
  asignaturasFiltradas = [...this.asignaturas];
  facultadesFiltradas = [...this.facultadesData];
  horariosFiltrados = [...this.horarios];


  busquedaPeriodos = '';
  busquedaCarreras = '';
  busquedaAsignaturas = '';
  busquedaFacultades = '';
  busquedaHorarios = '';


  mostrarModal = false;
  modoEdicion = false;
  tipoEdicion = '';
  indiceEdicion = -1;


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
    facultad: '',
    estado: 'ACTIVA'
  };

  formularioAsignatura = {
    nombre: '',
    carrera: '',
    nivel: 1,
    horasSemanales: 4,
    requiereLaboratorio: 'NO',
    estado: 'ACTIVA'
  };

  formularioFacultad = {
    nombre: '',
    descripcion: '',
    decano: '',
    fechaCreacion: '',
    estado: 'ACTIVO'
  };

  formularioHorario = {
    periodo: '',
    asignatura: '',
    docente: '',
    diaSemana: '',
    horaInicio: '',
    horaFin: '',
    numeroEstudiantes: 30
  };


  decanos = [
    'Dr. Carlos Rodríguez',
    'Dra. Laura Fernández',
    'Lic. Pedro Gómez',
    'MSc. Roberto Sánchez',
    'PhD. Julia Méndez',
    'Ing. Ana Martínez',
    'Dr. Miguel Torres',
    'Dra. Patricia López'
  ];

  docentes = [
    'Dr. Carlos Rodríguez',
    'Ing. Ana Martínez',
    'Dra. Laura Fernández',
    'Lic. Pedro Gómez',
    'MSc. Roberto Sánchez',
    'PhD. Julia Méndez'
  ];

  horas = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00'
  ];

  constructor(private router: Router,
              private periodo: PeriodoService,
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
    console.log('Módulo Académico cargado');
    this.cargarPeriodos();
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

  filtrarCarreras() {
    const busqueda = this.busquedaCarreras.toLowerCase();
    this.carrerasFiltradas = this.carreras.filter(carrera =>
      carrera.nombre.toLowerCase().includes(busqueda) ||
      carrera.facultad.toLowerCase().includes(busqueda) ||
      carrera.estado.toLowerCase().includes(busqueda)
    );
  }

  filtrarAsignaturas() {
    const busqueda = this.busquedaAsignaturas.toLowerCase();
    this.asignaturasFiltradas = this.asignaturas.filter(asignatura =>
      asignatura.nombre.toLowerCase().includes(busqueda) ||
      asignatura.carrera.toLowerCase().includes(busqueda) ||
      asignatura.estado.toLowerCase().includes(busqueda)
    );
  }

  filtrarFacultades() {
    const busqueda = this.busquedaFacultades.toLowerCase();
    this.facultadesFiltradas = this.facultadesData.filter(facultad =>
      facultad.nombre.toLowerCase().includes(busqueda) ||
      facultad.decano.toLowerCase().includes(busqueda) ||
      (facultad.descripcion && facultad.descripcion.toLowerCase().includes(busqueda)) ||
      facultad.estado.toLowerCase().includes(busqueda)
    );
  }

  filtrarHorarios() {
    const busqueda = this.busquedaHorarios.toLowerCase();
    this.horariosFiltrados = this.horarios.filter(horario =>
      horario.periodo.toLowerCase().includes(busqueda) ||
      horario.asignatura.toLowerCase().includes(busqueda) ||
      horario.docente.toLowerCase().includes(busqueda) ||
      horario.diaSemana.toLowerCase().includes(busqueda)
    );
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
        this.formularioCarrera = { ...item };
        break;
      case 'asignatura':
        this.formularioAsignatura = { ...item };
        break;
      case 'facultad':
        this.formularioFacultad = { ...item };
        break;
      case 'horario':
        this.formularioHorario = { ...item };
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
              alert('Período eliminado');
            }
          });
          break;
        case 'carrera':
          this.carreras.splice(index, 1);
          this.filtrarCarreras();
          this.cdr.detectChanges();
          break;
        case 'asignatura':
          this.asignaturas.splice(index, 1);
          this.filtrarAsignaturas();
          this.cdr.detectChanges();
          break;
        case 'facultad':
          this.facultadesData.splice(index, 1);
          this.filtrarFacultades();
          this.cdr.detectChanges();
          break;
        case 'horario':
          this.horarios.splice(index, 1);
          this.filtrarHorarios();
          this.cdr.detectChanges();
          break;
      }
      alert(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} eliminado exitosamente`);
    }
  }

  guardar() {
    if (!this.validarFormulario()) return;

    switch(this.tipoEdicion) {
      case 'periodo':
        const periodo: Periodo = {
          nombrePeriodo: this.formularioPeriodo.nombre,
          fechaInicio: this.formularioPeriodo.fechaInicio,
          fechaFin: this.formularioPeriodo.fechaFin,
          fechaCreacion: this.formularioPeriodo.fechaCreacion,
          estado: this.formularioPeriodo.estado
        };

        if (this.modoEdicion && this.periodos[this.indiceEdicion].idPeriodo) {

          this.periodo
            .editar(this.periodos[this.indiceEdicion].idPeriodo!, periodo)
            .subscribe({
              next: (periodoActualizado) => {
                this.periodos[this.indiceEdicion] = periodoActualizado;
                this.periodosFiltrado = [...this.periodos];
                this.cdr.detectChanges();
                this.cerrarModal();
                alert('Período actualizado');
              },
              error: () => alert('Error al editar período')
            });

        } else {

          this.periodo.crear(periodo).subscribe({
            next: (periodoCreado) => {
              this.periodos.push(periodoCreado);
              this.periodosFiltrado = [...this.periodos];
              this.cdr.detectChanges();
              this.cerrarModal();
              alert('Período creado');
            },
            error: () => alert('Error al crear período')
          });
        }
        break;

      case 'carrera':
        const carrera = { ...this.formularioCarrera };
        if (this.modoEdicion) {
          this.carreras[this.indiceEdicion] = carrera;
        } else {
          this.carreras.push(carrera);
        }
        this.filtrarCarreras();
        this.cdr.detectChanges();
        break;

      case 'asignatura':
        const asignatura = { ...this.formularioAsignatura };
        if (this.modoEdicion) {
          this.asignaturas[this.indiceEdicion] = asignatura;
        } else {
          this.asignaturas.push(asignatura);
        }
        this.filtrarAsignaturas();
        this.cdr.detectChanges();
        break;

      case 'facultad':
        const facultad = { ...this.formularioFacultad };
        if (this.modoEdicion) {
          this.facultadesData[this.indiceEdicion] = facultad;
        } else {
          this.facultadesData.push(facultad);
        }
        this.filtrarFacultades();
        this.cdr.detectChanges();
        break;

      case 'horario':
        const horario = { ...this.formularioHorario };
        if (this.modoEdicion) {
          this.horarios[this.indiceEdicion] = horario;
        } else {
          this.horarios.push(horario);
        }
        this.filtrarHorarios();
        this.cdr.detectChanges();
        break;
    }

    this.cerrarModal();
    alert(`${this.tipoEdicion} ${this.modoEdicion ? 'actualizado' : 'agregado'} exitosamente`);
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
        if (!this.formularioCarrera.facultad) {
          alert('La facultad es requerida');
          return false;
        }
        break;

      case 'asignatura':
        if (!this.formularioAsignatura.nombre.trim()) {
          alert('El nombre de la asignatura es requerido');
          return false;
        }
        if (!this.formularioAsignatura.carrera) {
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
        if (!this.formularioFacultad.decano) {
          alert('El decano es requerido');
          return false;
        }
        if (!this.formularioFacultad.fechaCreacion) {
          alert('La fecha de creación es requerida');
          return false;
        }
        break;

      case 'horario':
        if (!this.formularioHorario.periodo) {
          alert('El período académico es requerido');
          return false;
        }
        if (!this.formularioHorario.asignatura) {
          alert('La asignatura es requerida');
          return false;
        }
        if (!this.formularioHorario.docente) {
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
        if (this.formularioHorario.numeroEstudiantes < 1 || this.formularioHorario.numeroEstudiantes > 100) {
          alert('El número de estudiantes debe estar entre 1 y 100');
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
      facultad: '',
      estado: 'ACTIVA'
    };

    this.formularioAsignatura = {
      nombre: '',
      carrera: '',
      nivel: 1,
      horasSemanales: 4,
      requiereLaboratorio: 'NO',
      estado: 'ACTIVA'
    };

    this.formularioFacultad = {
      nombre: '',
      descripcion: '',
      decano: '',
      fechaCreacion: '',
      estado: 'ACTIVO'
    };

    this.formularioHorario = {
      periodo: '',
      asignatura: '',
      docente: '',
      diaSemana: '',
      horaInicio: '',
      horaFin: '',
      numeroEstudiantes: 30
    };
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
//cha madre loco
  logout() {
    this.router.navigate(['/']);
  }
}
