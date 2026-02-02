import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-academico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './academico.html',
  styleUrls: ['./academico.scss']
})
export class AcademicoComponent implements OnInit {


  tabActiva = 0;


  periodos = [
    { nombre: 'Semestre I 2024', fechaInicio: '2024-01-15', fechaFin: '2024-06-20', estado: 'ACTIVO' },
    { nombre: 'Semestre II 2023', fechaInicio: '2023-08-01', fechaFin: '2023-12-20', estado: 'INACTIVO' },
    { nombre: 'Verano 2024', fechaInicio: '2024-01-02', fechaFin: '2024-02-10', estado: 'INACTIVO' },
    { nombre: 'Semestre II 2024', fechaInicio: '2024-08-01', fechaFin: '2024-12-20', estado: 'ACTIVO' }
  ];

  carreras = [
    { nombre: 'Ingeniería de Sistemas', facultad: 'Ingeniería', estado: 'ACTIVA' },
    { nombre: 'Medicina', facultad: 'Ciencias Médicas', estado: 'ACTIVA' },
    { nombre: 'Administración de Empresas', facultad: 'Ciencias Económicas', estado: 'ACTIVA' },
    { nombre: 'Derecho', facultad: 'Ciencias Jurídicas', estado: 'INACTIVA' },
    { nombre: 'Psicología', facultad: 'Ciencias Sociales', estado: 'ACTIVA' }
  ];

  asignaturas = [
    { nombre: 'Programación I', carrera: 'Ingeniería de Sistemas', nivel: 1, horasSemanales: 6, requiereLaboratorio: 'SI', estado: 'ACTIVA' },
    { nombre: 'Base de Datos', carrera: 'Ingeniería de Sistemas', nivel: 3, horasSemanales: 6, requiereLaboratorio: 'SI', estado: 'ACTIVA' },
    { nombre: 'Anatomía Humana', carrera: 'Medicina', nivel: 2, horasSemanales: 8, requiereLaboratorio: 'SI', estado: 'ACTIVA' },
    { nombre: 'Contabilidad General', carrera: 'Administración de Empresas', nivel: 1, horasSemanales: 4, requiereLaboratorio: 'NO', estado: 'ACTIVA' },
    { nombre: 'Derecho Civil', carrera: 'Derecho', nivel: 1, horasSemanales: 5, requiereLaboratorio: 'NO', estado: 'INACTIVA' }
  ];

  estudiantes = [
    { identidad: '0801-1990-12345', tipoIdentidad: 'DNI', nombres: 'Juan Carlos', apellidos: 'Pérez López', email: 'juan.perez@universidad.edu', carrera: 'Ingeniería de Sistemas', estado: 'ACTIVO' },
    { identidad: '0801-1992-67890', tipoIdentidad: 'DNI', nombres: 'María José', apellidos: 'García Rodríguez', email: 'maria.garcia@universidad.edu', carrera: 'Medicina', estado: 'ACTIVO' },
    { identidad: 'PAS-001234', tipoIdentidad: 'PASAPORTE', nombres: 'Carlos Andrés', apellidos: 'Martínez Sánchez', email: 'carlos.martinez@universidad.edu', carrera: 'Administración de Empresas', estado: 'INACTIVO' },
    { identidad: '0801-1995-54321', tipoIdentidad: 'DNI', nombres: 'Ana Isabel', apellidos: 'Fernández Castro', email: 'ana.fernandez@universidad.edu', carrera: 'Psicología', estado: 'ACTIVO' }
  ];

  horarios = [
    { periodo: '2024-I', asignatura: 'Programación I', docente: 'Dr. Carlos Rodríguez', diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '10:00', numeroEstudiantes: 35 },
    { periodo: '2024-I', asignatura: 'Base de Datos', docente: 'Ing. Ana Martínez', diaSemana: 'MIÉRCOLES', horaInicio: '10:00', horaFin: '12:00', numeroEstudiantes: 28 },
    { periodo: '2024-I', asignatura: 'Anatomía Humana', docente: 'Dra. Laura Fernández', diaSemana: 'VIERNES', horaInicio: '14:00', horaFin: '16:00', numeroEstudiantes: 45 },
    { periodo: '2024-II', asignatura: 'Contabilidad General', docente: 'Lic. Pedro Gómez', diaSemana: 'MARTES', horaInicio: '16:00', horaFin: '18:00', numeroEstudiantes: 32 }
  ];


  periodosFiltrados = [...this.periodos];
  carrerasFiltradas = [...this.carreras];
  asignaturasFiltradas = [...this.asignaturas];
  estudiantesFiltrados = [...this.estudiantes];
  horariosFiltrados = [...this.horarios];


  busquedaPeriodos = '';
  busquedaCarreras = '';
  busquedaAsignaturas = '';
  busquedaEstudiantes = '';
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
    estado: 'ACTIVO'
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

  formularioEstudiante = {
    tipoIdentidad: 'DNI',
    identidad: '',
    nombres: '',
    apellidos: '',
    email: '',
    carrera: '',
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

  // Listas para selectores
  facultades = [
    'Ingeniería',
    'Ciencias Médicas',
    'Ciencias Económicas',
    'Ciencias Jurídicas',
    'Ciencias Sociales',
    'Ciencias Básicas'
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

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('Módulo Académico cargado');
  }

  // Métodos de navegación
  cambiarTab(tabIndex: number) {
    this.tabActiva = tabIndex;
  }

  getTextoBoton(): string {
    switch(this.tabActiva) {
      case 0: return 'Período';
      case 1: return 'Carrera';
      case 2: return 'Asignatura';
      case 3: return 'Estudiante';
      case 4: return 'Horario';
      default: return '';
    }
  }

  getTipoTexto(): string {
    switch(this.tipoEdicion) {
      case 'periodo': return 'Período Académico';
      case 'carrera': return 'Carrera';
      case 'asignatura': return 'Asignatura';
      case 'estudiante': return 'Estudiante';
      case 'horario': return 'Horario';
      default: return '';
    }
  }


  filtrarPeriodos() {
    const busqueda = this.busquedaPeriodos.toLowerCase();
    this.periodosFiltrados = this.periodos.filter(periodo =>
      periodo.nombre.toLowerCase().includes(busqueda) ||
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

  filtrarEstudiantes() {
    const busqueda = this.busquedaEstudiantes.toLowerCase();
    this.estudiantesFiltrados = this.estudiantes.filter(estudiante =>
      estudiante.nombres.toLowerCase().includes(busqueda) ||
      estudiante.apellidos.toLowerCase().includes(busqueda) ||
      estudiante.identidad.toLowerCase().includes(busqueda) ||
      estudiante.email.toLowerCase().includes(busqueda) ||
      estudiante.carrera.toLowerCase().includes(busqueda)
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
      case 3: this.tipoEdicion = 'estudiante'; break;
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
        this.formularioPeriodo = { ...item };
        break;
      case 'carrera':
        this.formularioCarrera = { ...item };
        break;
      case 'asignatura':
        this.formularioAsignatura = { ...item };
        break;
      case 'estudiante':
        this.formularioEstudiante = { ...item };
        break;
      case 'horario':
        this.formularioHorario = { ...item };
        break;
    }

    this.mostrarModal = true;
  }

  eliminar(item: any, index: number, tipo: string) {
    const confirmacion = confirm(`¿Está seguro que desea eliminar este ${tipo}?\n\n${item.nombre || item.identidad || item.asignatura}`);

    if (confirmacion) {
      switch(tipo) {
        case 'periodo':
          this.periodos.splice(index, 1);
          this.filtrarPeriodos();
          break;
        case 'carrera':
          this.carreras.splice(index, 1);
          this.filtrarCarreras();
          break;
        case 'asignatura':
          this.asignaturas.splice(index, 1);
          this.filtrarAsignaturas();
          break;
        case 'estudiante':
          this.estudiantes.splice(index, 1);
          this.filtrarEstudiantes();
          break;
        case 'horario':
          this.horarios.splice(index, 1);
          this.filtrarHorarios();
          break;
      }
      alert(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} eliminado exitosamente`);
    }
  }

  guardar() {
    if (!this.validarFormulario()) return;

    switch(this.tipoEdicion) {
      case 'periodo':
        const periodo = { ...this.formularioPeriodo };
        if (this.modoEdicion) {
          this.periodos[this.indiceEdicion] = periodo;
        } else {
          this.periodos.push(periodo);
        }
        this.filtrarPeriodos();
        break;

      case 'carrera':
        const carrera = { ...this.formularioCarrera };
        if (this.modoEdicion) {
          this.carreras[this.indiceEdicion] = carrera;
        } else {
          this.carreras.push(carrera);
        }
        this.filtrarCarreras();
        break;

      case 'asignatura':
        const asignatura = { ...this.formularioAsignatura };
        if (this.modoEdicion) {
          this.asignaturas[this.indiceEdicion] = asignatura;
        } else {
          this.asignaturas.push(asignatura);
        }
        this.filtrarAsignaturas();
        break;

      case 'estudiante':
        const estudiante = { ...this.formularioEstudiante };
        if (this.modoEdicion) {
          this.estudiantes[this.indiceEdicion] = estudiante;
        } else {
          this.estudiantes.push(estudiante);
        }
        this.filtrarEstudiantes();
        break;

      case 'horario':
        const horario = { ...this.formularioHorario };
        if (this.modoEdicion) {
          this.horarios[this.indiceEdicion] = horario;
        } else {
          this.horarios.push(horario);
        }
        this.filtrarHorarios();
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
          alert('La fecha de inicio debe ser anterior a la fecha de fin');
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

      case 'estudiante':
        if (!this.formularioEstudiante.tipoIdentidad) {
          alert('El tipo de identidad es requerido');
          return false;
        }
        if (!this.formularioEstudiante.identidad.trim()) {
          alert('El número de identidad es requerido');
          return false;
        }
        if (!this.formularioEstudiante.nombres.trim()) {
          alert('Los nombres son requeridos');
          return false;
        }
        if (!this.formularioEstudiante.apellidos.trim()) {
          alert('Los apellidos son requeridos');
          return false;
        }
        if (!this.formularioEstudiante.email.trim()) {
          alert('El email es requerido');
          return false;
        }
        if (!this.validarEmail(this.formularioEstudiante.email)) {
          alert('El email no tiene un formato válido');
          return false;
        }
        if (!this.formularioEstudiante.carrera) {
          alert('La carrera es requerida');
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

  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
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
      estado: 'ACTIVO'
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

    this.formularioEstudiante = {
      tipoIdentidad: 'DNI',
      identidad: '',
      nombres: '',
      apellidos: '',
      email: '',
      carrera: '',
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

  logout() {
    this.router.navigate(['/']);
  }
}
