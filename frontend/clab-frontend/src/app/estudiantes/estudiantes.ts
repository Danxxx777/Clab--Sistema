import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ===========================
// INTERFACES
// ===========================
interface Estudiante {
  id_estudiante: number;
  tipo_identidad: string;
  identidad: string;
  nombres: string;
  apellidos: string;
  email: string;
  id_carrera: number;
  estado: string;
  nombre_carrera?: string;
}

interface Matricula {
  id_matricula: number;
  id_estudiante: number;
  id_carrera: number;
  id_periodo: number;
  semestre: number;
  paralelo: string;
  estado: string;
  nombre_estudiante?: string;
  nombre_carrera?: string;
  nombre_periodo?: string;
}

interface Inscripcion {
  id_inscripcion: number;
  id_estudiante: number;
  id_asignatura: number;
  id_periodo: number;
  estado: string;
  nombre_estudiante?: string;
  nombre_asignatura?: string;
  nombre_periodo?: string;
}

interface Carrera {
  id_carrera: number;
  nombre_carrera: string;
  id_facultad: number;
  estado: string;
}

interface PeriodoAcademico {
  id_periodo: number;
  nombre_periodo: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
}

interface Asignatura {
  id_asignatura: number;
  nombre: string;
  id_carrera: number;
  nivel: number;
  horas_semanales: number;
  requiere_laboratorio: boolean;
  estado: string;
}

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estudiantes.html',
  styleUrls: ['./estudiantes.scss']
})
export class EstudiantesComponent implements OnInit {

  tabActiva: number = 0;
  drawerAbierto = false;
  rol = sessionStorage.getItem('rol') || '';
  usuarioLogueado = sessionStorage.getItem('usuario') || 'Usuario';

  // ===========================
  // DATOS - ESTUDIANTES
  // ===========================
  estudiantes: Estudiante[] = [
    {
      id_estudiante: 1,
      tipo_identidad: 'Cedula',
      identidad: '0912345678',
      nombres: 'Carlos',
      apellidos: 'Mendoza López',
      email: 'carlos.mendoza@estudiante.edu.ec',
      id_carrera: 1,
      estado: 'Activo',
      nombre_carrera: 'Ingeniería en Sistemas'
    },
    {
      id_estudiante: 2,
      tipo_identidad: 'Cedula',
      identidad: '0923456789',
      nombres: 'María',
      apellidos: 'García Flores',
      email: 'maria.garcia@estudiante.edu.ec',
      id_carrera: 2,
      estado: 'Activo',
      nombre_carrera: 'Medicina'
    },
    {
      id_estudiante: 3,
      tipo_identidad: 'Pasaporte',
      identidad: 'AB123456',
      nombres: 'Luis',
      apellidos: 'Ramírez Torres',
      email: 'luis.ramirez@estudiante.edu.ec',
      id_carrera: 1,
      estado: 'Activo',
      nombre_carrera: 'Ingeniería en Sistemas'
    },
    {
      id_estudiante: 4,
      tipo_identidad: 'Cedula',
      identidad: '0945678901',
      nombres: 'Ana',
      apellidos: 'Morales Castro',
      email: 'ana.morales@estudiante.edu.ec',
      id_carrera: 3,
      estado: 'Inactivo',
      nombre_carrera: 'Derecho'
    },
    {
      id_estudiante: 5,
      tipo_identidad: 'Pasaporte',
      identidad: 'CD789012',
      nombres: 'Pedro',
      apellidos: 'Silva Gómez',
      email: 'pedro.silva@estudiante.edu.ec',
      id_carrera: 4,
      estado: 'Activo',
      nombre_carrera: 'Administración de Empresas'
    }
  ];

  // ===========================
  // DATOS - MATRÍCULAS
  // ===========================
  matriculas: Matricula[] = [
    {
      id_matricula: 1,
      id_estudiante: 1,
      id_carrera: 1,
      id_periodo: 1,
      semestre: 5,
      paralelo: 'A',
      estado: 'Activa',
      nombre_estudiante: 'Carlos Mendoza López',
      nombre_carrera: 'Ingeniería en Sistemas',
      nombre_periodo: '2024-1'
    },
    {
      id_matricula: 2,
      id_estudiante: 2,
      id_carrera: 2,
      id_periodo: 1,
      semestre: 3,
      paralelo: 'B',
      estado: 'Activa',
      nombre_estudiante: 'María García Flores',
      nombre_carrera: 'Medicina',
      nombre_periodo: '2024-1'
    },
    {
      id_matricula: 3,
      id_estudiante: 3,
      id_carrera: 1,
      id_periodo: 1,
      semestre: 6,
      paralelo: 'A',
      estado: 'Activa',
      nombre_estudiante: 'Luis Ramírez Torres',
      nombre_carrera: 'Ingeniería en Sistemas',
      nombre_periodo: '2024-1'
    },
    {
      id_matricula: 4,
      id_estudiante: 5,
      id_carrera: 4,
      id_periodo: 2,
      semestre: 2,
      paralelo: 'C',
      estado: 'Activa',
      nombre_estudiante: 'Pedro Silva Gómez',
      nombre_carrera: 'Administración de Empresas',
      nombre_periodo: '2024-2'
    }
  ];

  // ===========================
  // DATOS - INSCRIPCIONES
  // ===========================
  inscripciones: Inscripcion[] = [
    {
      id_inscripcion: 1,
      id_estudiante: 1,
      id_asignatura: 1,
      id_periodo: 1,
      estado: 'Activa',
      nombre_estudiante: 'Carlos Mendoza López',
      nombre_asignatura: 'Programación Avanzada',
      nombre_periodo: '2024-1'
    },
    {
      id_inscripcion: 2,
      id_estudiante: 1,
      id_asignatura: 2,
      id_periodo: 1,
      estado: 'Activa',
      nombre_estudiante: 'Carlos Mendoza López',
      nombre_asignatura: 'Base de Datos',
      nombre_periodo: '2024-1'
    },
    {
      id_inscripcion: 3,
      id_estudiante: 2,
      id_asignatura: 3,
      id_periodo: 1,
      estado: 'Activa',
      nombre_estudiante: 'María García Flores',
      nombre_asignatura: 'Anatomía Humana',
      nombre_periodo: '2024-1'
    },
    {
      id_inscripcion: 4,
      id_estudiante: 3,
      id_asignatura: 1,
      id_periodo: 1,
      estado: 'Aprobada',
      nombre_estudiante: 'Luis Ramírez Torres',
      nombre_asignatura: 'Programación Avanzada',
      nombre_periodo: '2024-1'
    },
    {
      id_inscripcion: 5,
      id_estudiante: 5,
      id_asignatura: 4,
      id_periodo: 2,
      estado: 'Activa',
      nombre_estudiante: 'Pedro Silva Gómez',
      nombre_asignatura: 'Contabilidad General',
      nombre_periodo: '2024-2'
    }
  ];

  // ===========================
  // DATOS - CARRERAS
  // ===========================
  carreras: Carrera[] = [
    {
      id_carrera: 1,
      nombre_carrera: 'Ingeniería en Sistemas',
      id_facultad: 1,
      estado: 'Activa'
    },
    {
      id_carrera: 2,
      nombre_carrera: 'Medicina',
      id_facultad: 2,
      estado: 'Activa'
    },
    {
      id_carrera: 3,
      nombre_carrera: 'Derecho',
      id_facultad: 3,
      estado: 'Activa'
    },
    {
      id_carrera: 4,
      nombre_carrera: 'Administración de Empresas',
      id_facultad: 4,
      estado: 'Activa'
    },
    {
      id_carrera: 5,
      nombre_carrera: 'Psicología',
      id_facultad: 5,
      estado: 'Activa'
    }
  ];

  // ===========================
  // DATOS - PERIODOS ACADÉMICOS
  // ===========================
  periodos: PeriodoAcademico[] = [
    {
      id_periodo: 1,
      nombre_periodo: '2024-1',
      fecha_inicio: '2024-04-01',
      fecha_fin: '2024-08-31',
      estado: 'Activo'
    },
    {
      id_periodo: 2,
      nombre_periodo: '2024-2',
      fecha_inicio: '2024-09-01',
      fecha_fin: '2025-01-31',
      estado: 'Activo'
    },
    {
      id_periodo: 3,
      nombre_periodo: '2023-2',
      fecha_inicio: '2023-09-01',
      fecha_fin: '2024-01-31',
      estado: 'Inactivo'
    }
  ];

  // ===========================
  // DATOS - ASIGNATURAS
  // ===========================
  asignaturas: Asignatura[] = [
    {
      id_asignatura: 1,
      nombre: 'Programación Avanzada',
      id_carrera: 1,
      nivel: 5,
      horas_semanales: 6,
      requiere_laboratorio: true,
      estado: 'Activa'
    },
    {
      id_asignatura: 2,
      nombre: 'Base de Datos',
      id_carrera: 1,
      nivel: 5,
      horas_semanales: 6,
      requiere_laboratorio: true,
      estado: 'Activa'
    },
    {
      id_asignatura: 3,
      nombre: 'Anatomía Humana',
      id_carrera: 2,
      nivel: 3,
      horas_semanales: 8,
      requiere_laboratorio: true,
      estado: 'Activa'
    },
    {
      id_asignatura: 4,
      nombre: 'Contabilidad General',
      id_carrera: 4,
      nivel: 2,
      horas_semanales: 4,
      requiere_laboratorio: false,
      estado: 'Activa'
    },
    {
      id_asignatura: 5,
      nombre: 'Derecho Constitucional',
      id_carrera: 3,
      nivel: 4,
      horas_semanales: 4,
      requiere_laboratorio: false,
      estado: 'Activa'
    }
  ];

  // ===========================
  // LISTAS FILTRADAS
  // ===========================
  estudiantesFiltrados: Estudiante[] = [];
  matriculasFiltradas: Matricula[] = [];
  inscripcionesFiltradas: Inscripcion[] = [];

  // ===========================
  // BÚSQUEDAS
  // ===========================
  busquedaEstudiantes: string = '';
  busquedaMatriculas: string = '';
  busquedaInscripciones: string = '';

  // ===========================
  // MODAL Y FORMULARIOS
  // ===========================
  mostrarModal: boolean = false;
  tipoModal: 'estudiante' | 'matricula' | 'inscripcion' | null = null;
  modoEdicion: boolean = false;
  indiceEdicion: number = -1;

  formularioEst: Estudiante = this.getFormularioEstVacio();
  formularioMat: Matricula = this.getFormularioMatVacio();
  formularioInsc: Inscripcion = this.getFormularioInscVacio();

  // ===========================
  // CONFIRMACIÓN ELIMINACIÓN
  // ===========================
  mostrarConfirmarEliminar: boolean = false;
  itemParaEliminar: any = null;
  indiceParaEliminar: number = -1;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.rol = sessionStorage.getItem('rol') || '';
    this.usuarioLogueado = sessionStorage.getItem('usuario') || 'Usuario';
    this.estudiantesFiltrados = [...this.estudiantes];
    this.matriculasFiltradas = [...this.matriculas];
    this.inscripcionesFiltradas = [...this.inscripciones];
  }

  // ===========================
  // FORMULARIOS VACÍOS
  // ===========================
  getFormularioEstVacio(): Estudiante {
    return {
      id_estudiante: 0,
      tipo_identidad: 'Cedula',
      identidad: '',
      nombres: '',
      apellidos: '',
      email: '',
      id_carrera: 0,
      estado: 'Activo'
    };
  }

  getFormularioMatVacio(): Matricula {
    return {
      id_matricula: 0,
      id_estudiante: 0,
      id_carrera: 0,
      id_periodo: 0,
      semestre: 1,
      paralelo: '',
      estado: 'Activa'
    };
  }

  getFormularioInscVacio(): Inscripcion {
    return {
      id_inscripcion: 0,
      id_estudiante: 0,
      id_asignatura: 0,
      id_periodo: 0,
      estado: 'Activa'
    };
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
  // ===========================
  // NAVEGACIÓN
  // ===========================
  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  cambiarTab(index: number): void {
    this.tabActiva = index;
  }

  // ===========================
  // FILTRADO
  // ===========================
  filtrarEstudiantes(): void {
    const busqueda = this.busquedaEstudiantes.toLowerCase();
    this.estudiantesFiltrados = this.estudiantes.filter(est =>
      est.identidad.includes(busqueda) ||
      est.nombres.toLowerCase().includes(busqueda) ||
      est.apellidos.toLowerCase().includes(busqueda) ||
      est.email.toLowerCase().includes(busqueda) ||
      (est.nombre_carrera && est.nombre_carrera.toLowerCase().includes(busqueda))
    );
  }

  filtrarMatriculas(): void {
    const busqueda = this.busquedaMatriculas.toLowerCase();
    this.matriculasFiltradas = this.matriculas.filter(mat =>
      mat.id_matricula.toString().includes(busqueda) ||
      (mat.nombre_estudiante && mat.nombre_estudiante.toLowerCase().includes(busqueda)) ||
      (mat.nombre_carrera && mat.nombre_carrera.toLowerCase().includes(busqueda)) ||
      (mat.nombre_periodo && mat.nombre_periodo.toLowerCase().includes(busqueda)) ||
      mat.paralelo.toLowerCase().includes(busqueda)
    );
  }

  filtrarInscripciones(): void {
    const busqueda = this.busquedaInscripciones.toLowerCase();
    this.inscripcionesFiltradas = this.inscripciones.filter(insc =>
      insc.id_inscripcion.toString().includes(busqueda) ||
      (insc.nombre_estudiante && insc.nombre_estudiante.toLowerCase().includes(busqueda)) ||
      (insc.nombre_asignatura && insc.nombre_asignatura.toLowerCase().includes(busqueda)) ||
      (insc.nombre_periodo && insc.nombre_periodo.toLowerCase().includes(busqueda))
    );
  }

  // ===========================
  // MODAL
  // ===========================
  abrirModal(tipo: 'estudiante' | 'matricula' | 'inscripcion'): void {
    this.tipoModal = tipo;
    this.mostrarModal = true;
    this.modoEdicion = false;
    this.resetFormularios();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.tipoModal = null;
    this.modoEdicion = false;
    this.indiceEdicion = -1;
    this.resetFormularios();
  }

  resetFormularios(): void {
    this.formularioEst = this.getFormularioEstVacio();
    this.formularioMat = this.getFormularioMatVacio();
    this.formularioInsc = this.getFormularioInscVacio();
  }

  // ===========================
  // ESTUDIANTES
  // ===========================
  editarEstudiante(est: Estudiante, index: number): void {
    this.formularioEst = { ...est };
    this.modoEdicion = true;
    this.indiceEdicion = index;
    this.tipoModal = 'estudiante';
    this.mostrarModal = true;
  }

  guardarEstudiante(): void {
    if (!this.validarFormularioEst()) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    // Obtener nombre de carrera
    const carrera = this.carreras.find(c => c.id_carrera === this.formularioEst.id_carrera);
    this.formularioEst.nombre_carrera = carrera ? carrera.nombre_carrera : '';

    if (this.modoEdicion) {
      this.estudiantes[this.indiceEdicion] = { ...this.formularioEst };
    } else {
      this.formularioEst.id_estudiante = this.estudiantes.length + 1;
      this.estudiantes.push({ ...this.formularioEst });
    }

    this.filtrarEstudiantes();
    this.cerrarModal();
    alert(this.modoEdicion ? 'Estudiante actualizado exitosamente' : 'Estudiante agregado exitosamente');
  }

  eliminarEstudiante(est: Estudiante, index: number): void {
    this.itemParaEliminar = est;
    this.indiceParaEliminar = index;
    this.tipoModal = 'estudiante';
    this.mostrarConfirmarEliminar = true;
  }

  validarFormularioEst(): boolean {
    return !!(
      this.formularioEst.tipo_identidad &&
      this.formularioEst.identidad &&
      this.formularioEst.nombres &&
      this.formularioEst.apellidos &&
      this.formularioEst.email &&
      this.formularioEst.id_carrera > 0 &&
      this.formularioEst.estado
    );
  }

  // ===========================
  // MATRÍCULAS
  // ===========================
  editarMatricula(mat: Matricula, index: number): void {
    this.formularioMat = { ...mat };
    this.modoEdicion = true;
    this.indiceEdicion = index;
    this.tipoModal = 'matricula';
    this.mostrarModal = true;
  }

  guardarMatricula(): void {
    if (!this.validarFormularioMat()) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    // Obtener nombres
    const estudiante = this.estudiantes.find(e => e.id_estudiante === this.formularioMat.id_estudiante);
    const carrera = this.carreras.find(c => c.id_carrera === this.formularioMat.id_carrera);
    const periodo = this.periodos.find(p => p.id_periodo === this.formularioMat.id_periodo);

    this.formularioMat.nombre_estudiante = estudiante ? this.getNombreCompleto(estudiante.nombres, estudiante.apellidos) : '';
    this.formularioMat.nombre_carrera = carrera ? carrera.nombre_carrera : '';
    this.formularioMat.nombre_periodo = periodo ? periodo.nombre_periodo : '';

    if (this.modoEdicion) {
      this.matriculas[this.indiceEdicion] = { ...this.formularioMat };
    } else {
      this.formularioMat.id_matricula = this.matriculas.length + 1;
      this.matriculas.push({ ...this.formularioMat });
    }

    this.filtrarMatriculas();
    this.cerrarModal();
    alert(this.modoEdicion ? 'Matrícula actualizada exitosamente' : 'Matrícula agregada exitosamente');
  }

  eliminarMatricula(mat: Matricula, index: number): void {
    this.itemParaEliminar = mat;
    this.indiceParaEliminar = index;
    this.tipoModal = 'matricula';
    this.mostrarConfirmarEliminar = true;
  }

  validarFormularioMat(): boolean {
    return !!(
      this.formularioMat.id_estudiante > 0 &&
      this.formularioMat.id_carrera > 0 &&
      this.formularioMat.id_periodo > 0 &&
      this.formularioMat.semestre > 0 &&
      this.formularioMat.paralelo &&
      this.formularioMat.estado
    );
  }

  // ===========================
  // INSCRIPCIONES
  // ===========================
  editarInscripcion(insc: Inscripcion, index: number): void {
    this.formularioInsc = { ...insc };
    this.modoEdicion = true;
    this.indiceEdicion = index;
    this.tipoModal = 'inscripcion';
    this.mostrarModal = true;
  }

  guardarInscripcion(): void {
    if (!this.validarFormularioInsc()) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    // Obtener nombres
    const estudiante = this.estudiantes.find(e => e.id_estudiante === this.formularioInsc.id_estudiante);
    const asignatura = this.asignaturas.find(a => a.id_asignatura === this.formularioInsc.id_asignatura);
    const periodo = this.periodos.find(p => p.id_periodo === this.formularioInsc.id_periodo);

    this.formularioInsc.nombre_estudiante = estudiante ? this.getNombreCompleto(estudiante.nombres, estudiante.apellidos) : '';
    this.formularioInsc.nombre_asignatura = asignatura ? asignatura.nombre : '';
    this.formularioInsc.nombre_periodo = periodo ? periodo.nombre_periodo : '';

    if (this.modoEdicion) {
      this.inscripciones[this.indiceEdicion] = { ...this.formularioInsc };
    } else {
      this.formularioInsc.id_inscripcion = this.inscripciones.length + 1;
      this.inscripciones.push({ ...this.formularioInsc });
    }

    this.filtrarInscripciones();
    this.cerrarModal();
    alert(this.modoEdicion ? 'Inscripción actualizada exitosamente' : 'Inscripción agregada exitosamente');
  }

  eliminarInscripcion(insc: Inscripcion, index: number): void {
    this.itemParaEliminar = insc;
    this.indiceParaEliminar = index;
    this.tipoModal = 'inscripcion';
    this.mostrarConfirmarEliminar = true;
  }

  validarFormularioInsc(): boolean {
    return !!(
      this.formularioInsc.id_estudiante > 0 &&
      this.formularioInsc.id_asignatura > 0 &&
      this.formularioInsc.id_periodo > 0 &&
      this.formularioInsc.estado
    );
  }

  // ===========================
  // CONFIRMACIÓN ELIMINACIÓN
  // ===========================
  cerrarModalConfirmar(): void {
    this.mostrarConfirmarEliminar = false;
    this.itemParaEliminar = null;
    this.indiceParaEliminar = -1;
  }

  confirmarEliminacion(): void {
    if (this.tipoModal === 'estudiante') {
      this.estudiantes.splice(this.indiceParaEliminar, 1);
      this.filtrarEstudiantes();
    } else if (this.tipoModal === 'matricula') {
      this.matriculas.splice(this.indiceParaEliminar, 1);
      this.filtrarMatriculas();
    } else if (this.tipoModal === 'inscripcion') {
      this.inscripciones.splice(this.indiceParaEliminar, 1);
      this.filtrarInscripciones();
    }

    this.cerrarModalConfirmar();
    alert('Elemento eliminado exitosamente');
  }

  // ===========================
  // UTILIDADES
  // ===========================
  verDetalle(item: any): void {
    console.log('Ver detalle:', item);
  }

  getNombreCompleto(nombres?: string, apellidos?: string): string {
    return `${nombres || ''} ${apellidos || ''}`.trim();
  }

  getEstadoBadgeClass(estado: string): string {
    const estadoLower = estado.toLowerCase();
    if (estadoLower === 'activo' || estadoLower === 'activa' || estadoLower === 'aprobada') {
      return 'activo';
    }
    if (estadoLower === 'inactivo' || estadoLower === 'inactiva' || estadoLower === 'cancelada') {
      return 'inactivo';
    }
    if (estadoLower === 'retirado' || estadoLower === 'retirada') {
      return 'mantenimiento';
    }
    if (estadoLower === 'graduado' || estadoLower === 'reprobada') {
      return 'fuera';
    }
    return 'activo';
  }

  getItemNombre(): string {
    if (!this.itemParaEliminar) return '';

    if (this.tipoModal === 'estudiante') {
      return this.getNombreCompleto(this.itemParaEliminar.nombres, this.itemParaEliminar.apellidos);
    } else if (this.tipoModal === 'matricula') {
      return `Matrícula #${this.itemParaEliminar.id_matricula}`;
    } else if (this.tipoModal === 'inscripcion') {
      return `Inscripción #${this.itemParaEliminar.id_inscripcion}`;
    }

    return '';
  }

  getPlaceholderIdentidad(): string {
    switch (this.formularioEst.tipo_identidad) {
      case 'Cedula':
        return 'Ej: 0912345678';
      case 'Pasaporte':
        return 'Ej: AB123456';
      case 'RUC':
        return 'Ej: 0912345678001';
      case 'Otro':
        return 'Ingrese el número de documento';
      default:
        return 'Número de documento';
    }
  }

  getMaxLengthIdentidad(): number {
    switch (this.formularioEst.tipo_identidad) {
      case 'Cedula':
        return 10;
      case 'Pasaporte':
        return 20;
      case 'RUC':
        return 13;
      case 'Otro':
        return 30;
      default:
        return 20;
    }
  }
}
