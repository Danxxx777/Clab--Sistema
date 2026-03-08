import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// ─── INTERFACES ───────────────────────────────────────────────────────────────
interface Laboratorio {
  codLaboratorio: number;
  nombreLab: string;
}

interface ModuloConfig {
  id: string;
  titulo: string;
  desc: string;
  icono: string;
  color: string;
  colorHex: string;
}

interface StatModulo {
  icono: string;
  valor: string | number;
  label: string;
  color: string;
}

interface DatoGrafica {
  label: string;
  valor: number;
  pct: number;
}

@Component({
  selector: 'app-reportar',
  standalone: true,
  imports: [CommonModule, FormsModule],  // ← estas dos
  templateUrl: './reportar.html',
  styleUrls: ['./reportar.scss']
})
export class ReportarComponent{
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // ─── ESTADO GENERAL ────────────────────────────────────────────────────────
  usuarioLogueado = '';
  rol = '';
  drawerAbierto = false;

  moduloActivo: number | null = null;  // índice del módulo abierto o null = pantalla inicio
  busquedaRealizada = false;
  mostrarEstadisticas = false;
  cargando = false;

  // ─── MÓDULOS ───────────────────────────────────────────────────────────────
  modulos: ModuloConfig[] = [
    { id: 'uso',        titulo: 'Uso de Labs',  desc: 'Frecuencia y ocupación de laboratorios', icono: '/laboratorio.png', color: 'neon',     colorHex: '#39ff14' },
    { id: 'equipos',    titulo: 'Equipos',      desc: 'Inventario y estado general',            icono: '/equipo.png',      color: 'verde',    colorHex: '#10b981' },
    { id: 'fallas',     titulo: 'Fallas',       desc: 'Historial y seguimiento de fallas',      icono: '/fallas.png',      color: 'rojo',     colorHex: '#e74c3c' },
    { id: 'usuarios',   titulo: 'Usuarios',     desc: 'Actividad y roles del sistema',          icono: '/user.png',        color: 'azul',     colorHex: '#3b82f6' },
    { id: 'reservas',   titulo: 'Reservas',     desc: 'Historial de reservas de laboratorios',  icono: '/calendario.png',  color: 'naranja',  colorHex: '#e67e22' },
    { id: 'asistencia', titulo: 'Asistencia',   desc: 'Control de asistencia por laboratorio',  icono: '/asistencia.png',  color: 'cyan',     colorHex: '#06b6d4' },
    { id: 'academico',  titulo: 'Académico',    desc: 'Períodos, carreras y asignaturas',       icono: '/academico.png',   color: 'amarillo', colorHex: '#f59e0b' },
    { id: 'bloqueos',   titulo: 'Bloqueos',     desc: 'Bloqueos y restricciones de acceso',     icono: '/bloqueos.png',    color: 'morado',   colorHex: '#a855f7' },
  ];
  // ─── RESUMEN GLOBAL ────────────────────────────────────────────────────────
  resumenGlobal = {
    reservas: 0,
    asistencias: 0,
    fallas: 0,
    estudiantes: 0,
    equipos: 0,
    bloqueos: 0
  };

  // ─── FILTROS ───────────────────────────────────────────────────────────────
  laboratorios: Laboratorio[] = [];
  filtros = {
    fechaInicio: '',
    fechaFin: '',
    laboratorio: '',
    estado: ''
  };

  // ─── DATOS REPORTE ─────────────────────────────────────────────────────────
  datosReporte: any[] = [];
  statsModulo: StatModulo[] = [];
  datosGrafica: DatoGrafica[] = [];
  datosDistribucion: DatoGrafica[] = [];
  columnasTabla: string[] = [];
  tituloGrafica1 = '';
  tituloGrafica2 = '';

  coloresGrafica = ['#39ff14', '#3b82f6', '#e67e22', '#e74c3c', '#a855f7', '#06b6d4', '#f59e0b', '#10b981'];

  // ─── TOAST ─────────────────────────────────────────────────────────────────
  mostrarToast = false;
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';

  // ─── LIFECYCLE ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.rol = sessionStorage.getItem('rol') || '';
    const userData = sessionStorage.getItem('usuario') || sessionStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        this.usuarioLogueado = parsed.nombres
          ? `${parsed.nombres} ${parsed.apellidos}`
          : parsed.email || 'Usuario';
      } catch { this.usuarioLogueado = 'Usuario'; }
    }
    this.inicializarFechas();
    this.cargarLaboratorios();
    this.cargarResumenGlobal();
  }

  // ─── DRAWER ────────────────────────────────────────────────────────────────
  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }
  onDocumentClick(event: Event): void {
    const el = event.target as HTMLElement;
    if (this.drawerAbierto && !el.closest('.drawer') && !el.closest('.btn-hamburger')) {
      this.drawerAbierto = false;
    }
  }

  // ─── NAVEGACIÓN ────────────────────────────────────────────────────────────
  volver(): void { this.router.navigate(['/dashboard']); }
  navegar(ruta: string): void { this.cerrarDrawer(); this.router.navigate([`/${ruta}`]); }
  logout(): void { sessionStorage.clear(); this.router.navigate(['/login']); }

  abrirModulo(index: number): void {
    this.moduloActivo = index;
    this.datosReporte = [];
    this.statsModulo = [];
    this.datosGrafica = [];
    this.datosDistribucion = [];
    this.busquedaRealizada = false;
    this.mostrarEstadisticas = false;
    this.limpiarFiltros();
    this.cdr.detectChanges();
  }

  volverAlCentro(): void {
    this.moduloActivo = null;
    this.datosReporte = [];
    this.busquedaRealizada = false;
    this.mostrarEstadisticas = false;
    this.cdr.detectChanges();
  }

  // ─── DATOS INICIALES ───────────────────────────────────────────────────────
  inicializarFechas(): void {
    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hoy.getDate() - 30);
    this.filtros.fechaInicio = hace30.toISOString().split('T')[0];
    this.filtros.fechaFin    = hoy.toISOString().split('T')[0];
  }

  cargarLaboratorios(): void {
    // TODO: conectar al servicio real
    // this.labService.listar().subscribe(data => this.laboratorios = data);
    this.laboratorios = [
      { codLaboratorio: 1, nombreLab: 'Lab. Programación' },
      { codLaboratorio: 2, nombreLab: 'Lab. Redes' },
      { codLaboratorio: 3, nombreLab: 'Lab. Base de Datos' },
      { codLaboratorio: 4, nombreLab: 'Lab. IA' },
      { codLaboratorio: 5, nombreLab: 'Lab. SO' },
    ];
  }

  cargarResumenGlobal(): void {
    // TODO: conectar al endpoint real de resumen
    this.resumenGlobal = {
      reservas: 163,
      asistencias: 1170,
      fallas: 50,
      estudiantes: 375,
      equipos: 112,
      bloqueos: 18
    };
  }

  // ─── FILTROS ───────────────────────────────────────────────────────────────
  aplicarFiltros(): void {
    if (this.filtros.fechaInicio && this.filtros.fechaFin) {
      if (this.filtros.fechaInicio > this.filtros.fechaFin) {
        this.mostrarNotif('La fecha inicio no puede ser mayor a fecha fin', 'error');
        return;
      }
    }
    this.busquedaRealizada = true;
    this.cargando = true;

    // Simula carga (quitar cuando conectes el backend)
    setTimeout(() => {
      this.cargando = false;
      const id = this.modulos[this.moduloActivo!].id;
      switch (id) {
        case 'uso':        this.generarUso();       break;
        case 'equipos':    this.generarEquipos();    break;
        case 'fallas':     this.generarFallas();     break;
        case 'usuarios':   this.generarUsuarios();   break;
        case 'reservas':   this.generarReservas();   break;
        case 'asistencia': this.generarAsistencia(); break;
        case 'academico':  this.generarAcademico();  break;
        case 'bloqueos':   this.generarBloqueos();   break;
      }
      this.mostrarNotif('Reporte generado correctamente');
      this.cdr.detectChanges();
    }, 600);
  }

  limpiarFiltros(): void {
    this.inicializarFechas();
    this.filtros.laboratorio = '';
    this.filtros.estado = '';
    this.datosReporte = [];
    this.statsModulo = [];
    this.datosGrafica = [];
    this.datosDistribucion = [];
    this.busquedaRealizada = false;
    this.mostrarEstadisticas = false;
    this.cdr.detectChanges();
  }

  // ─── GENERADORES DE REPORTE ────────────────────────────────────────────────

  private generarUso(): void {
    this.statsModulo = [
      { icono: '📅', valor: 45,  label: 'Total Usos',   color: '#39ff14' },
      { icono: '⏱️', valor: '90h', label: 'Horas Totales', color: '#3b82f6' },
      { icono: '🏆', valor: 'Lab. Prog.', label: 'Más Usado', color: '#e67e22' },
      { icono: '👥', valor: 520, label: 'Estudiantes', color: '#a855f7' },
    ];
    this.tituloGrafica1 = 'Usos por Laboratorio';
    this.tituloGrafica2 = 'Distribución de Estados';
    this.datosGrafica = [
      { label: 'Lab. Prog.',  valor: 18, pct: 100 },
      { label: 'Lab. Redes',  valor: 12, pct: 67  },
      { label: 'Lab. BD',     valor: 8,  pct: 44  },
      { label: 'Lab. IA',     valor: 5,  pct: 28  },
      { label: 'Lab. SO',     valor: 2,  pct: 11  },
    ];
    this.datosDistribucion = [
      { label: 'Completada', valor: 38, pct: 84 },
      { label: 'Cancelada',  valor: 5,  pct: 11 },
      { label: 'Pendiente',  valor: 2,  pct: 5  },
    ];
    this.columnasTabla = ['LABORATORIO', 'FECHA', 'HORARIO', 'N° ESTUDIANTES', 'ESTADO'];
    this.datosReporte = [
      { lab: 'Lab. Programación', fecha: '20/02/2026', horario: '08:00 - 10:00', est: 28, estado: 'COMPLETADA' },
      { lab: 'Lab. Redes',        fecha: '21/02/2026', horario: '14:00 - 16:00', est: 22, estado: 'COMPLETADA' },
      { lab: 'Lab. BD',           fecha: '22/02/2026', horario: '10:00 - 12:00', est: 30, estado: 'CANCELADA'  },
    ];
    this.mostrarEstadisticas = true;
  }

  private generarEquipos(): void {
    this.statsModulo = [
      { icono: '🖥️', valor: 112, label: 'Total Equipos',       color: '#39ff14'  },
      { icono: '✅', valor: 97,  label: 'Operativos',           color: '#39ff14'  },
      { icono: '🔧', valor: 10,  label: 'En Mantenimiento',     color: '#e67e22'  },
      { icono: '❌', valor: 5,   label: 'Fuera de Servicio',    color: '#e74c3c'  },
    ];
    this.tituloGrafica1 = 'Equipos por Laboratorio';
    this.tituloGrafica2 = 'Estado de Equipos';
    this.datosGrafica = [
      { label: 'Lab. Prog.',  valor: 30, pct: 100 },
      { label: 'Lab. BD',     valor: 25, pct: 83  },
      { label: 'Lab. SO',     valor: 22, pct: 73  },
      { label: 'Lab. Redes',  valor: 20, pct: 67  },
      { label: 'Lab. IA',     valor: 15, pct: 50  },
    ];
    this.datosDistribucion = [
      { label: 'Operativo',        valor: 97, pct: 87 },
      { label: 'Mantenimiento',    valor: 10, pct: 9  },
      { label: 'Fuera de Servicio',valor: 5,  pct: 4  },
    ];
    this.columnasTabla = ['SERIE', 'NOMBRE', 'TIPO', 'LABORATORIO', 'ESTADO'];
    this.datosReporte = [
      { a: 'PC-001',  b: 'Computadora Dell', c: 'PC',         d: 'Lab. Programación', estado: 'OPERATIVO'     },
      { a: 'SW-005',  b: 'Switch Cisco',      c: 'Networking', d: 'Lab. Redes',         estado: 'MANTENIMIENTO' },
      { a: 'PC-007',  b: 'Computadora HP',   c: 'PC',         d: 'Lab. Redes',         estado: 'FUERA'         },
    ];
    this.mostrarEstadisticas = true;
  }

  private generarFallas(): void {
    this.statsModulo = [
      { icono: '⚠️', valor: 50, label: 'Total Fallas',  color: '#e67e22' },
      { icono: '🔴', valor: 17, label: 'Pendientes',    color: '#e74c3c' },
      { icono: '🔧', valor: 8,  label: 'En Proceso',    color: '#e67e22' },
      { icono: '✅', valor: 25, label: 'Resueltas',     color: '#39ff14' },
    ];
    this.tituloGrafica1 = 'Fallas por Laboratorio';
    this.tituloGrafica2 = 'Estado de Fallas';
    this.datosGrafica = [
      { label: 'Lab. Prog.',  valor: 18, pct: 100 },
      { label: 'Lab. Redes',  valor: 14, pct: 78  },
      { label: 'Lab. BD',     valor: 9,  pct: 50  },
      { label: 'Lab. IA',     valor: 6,  pct: 33  },
      { label: 'Lab. SO',     valor: 3,  pct: 17  },
    ];
    this.datosDistribucion = [
      { label: 'Resuelto',   valor: 25, pct: 50 },
      { label: 'Pendiente',  valor: 17, pct: 34 },
      { label: 'En proceso', valor: 8,  pct: 16 },
    ];
    this.columnasTabla = ['FECHA', 'LABORATORIO', 'EQUIPO', 'DESCRIPCIÓN', 'ESTADO'];
    this.datosReporte = [
      { a: '20/02/2026', b: 'Lab. Prog.',  c: 'PC Dell PC-001', d: 'No enciende pantalla',      estado: 'PENDIENTE'  },
      { a: '21/02/2026', b: 'Lab. Redes',  c: 'Switch SW-005',  d: 'Intermitencias en red',     estado: 'EN PROCESO' },
      { a: '22/02/2026', b: 'Lab. BD',     c: 'Servidor HP',    d: 'Disco duro lento',          estado: 'RESUELTO'   },
    ];
    this.mostrarEstadisticas = true;
  }

  private generarUsuarios(): void {
    this.statsModulo = [
      { icono: '👥', valor: 15, label: 'Total Usuarios', color: '#39ff14' },
      { icono: '✅', valor: 15, label: 'Activos',        color: '#39ff14' },
      { icono: '🚫', valor: 0,  label: 'Inactivos',      color: '#e74c3c' },
      { icono: '🔑', valor: 6,  label: 'Roles',          color: '#3b82f6' },
    ];
    this.tituloGrafica1 = 'Usuarios por Rol';
    this.tituloGrafica2 = 'Estado de Usuarios';
    this.datosGrafica = [
      { label: 'Docente',      valor: 6, pct: 100 },
      { label: 'Encargado',    valor: 4, pct: 67  },
      { label: 'Admin',        valor: 2, pct: 33  },
      { label: 'Coordinador',  valor: 2, pct: 33  },
      { label: 'Decano',       valor: 1, pct: 17  },
    ];
    this.datosDistribucion = [
      { label: 'Activo',   valor: 15, pct: 100 },
      { label: 'Inactivo', valor: 0,  pct: 0   },
    ];
    this.columnasTabla = ['IDENTIDAD', 'NOMBRE COMPLETO', 'EMAIL', 'ROL', 'ESTADO'];
    this.datosReporte = [
      { a: '0923456789', b: 'Juan Pérez González',   c: 'juan.perez@uteq.edu.ec',   d: 'Docente',   estado: 'ACTIVO' },
      { a: '0987654321', b: 'María García López',    c: 'maria.garcia@uteq.edu.ec',  d: 'Encargado', estado: 'ACTIVO' },
      { a: '0912345678', b: 'Carlos Torres Mora',    c: 'carlos.torres@uteq.edu.ec', d: 'Docente',   estado: 'ACTIVO' },
    ];
    this.mostrarEstadisticas = true;
  }

  private generarReservas(): void {
    this.statsModulo = [
      { icono: '📋', valor: 163, label: 'Total Reservas',  color: '#39ff14' },
      { icono: '✅', valor: 141, label: 'Aprobadas',       color: '#39ff14' },
      { icono: '⏳', valor: 12,  label: 'Pendientes',      color: '#e67e22' },
      { icono: '❌', valor: 10,  label: 'Canceladas',      color: '#e74c3c' },
    ];
    this.tituloGrafica1 = 'Reservas por Laboratorio';
    this.tituloGrafica2 = 'Estados de Reservas';
    this.datosGrafica = [
      { label: 'Lab. Prog.',  valor: 45, pct: 100 },
      { label: 'Lab. IA',     valor: 38, pct: 84  },
      { label: 'Lab. Redes',  valor: 32, pct: 71  },
      { label: 'Lab. BD',     valor: 28, pct: 62  },
      { label: 'Lab. SO',     valor: 20, pct: 44  },
    ];
    this.datosDistribucion = [
      { label: 'Aprobada',  valor: 141, pct: 87 },
      { label: 'Pendiente', valor: 12,  pct: 7  },
      { label: 'Cancelada', valor: 10,  pct: 6  },
    ];
    this.columnasTabla = ['FECHA', 'LABORATORIO', 'HORARIO', 'TIPO', 'MOTIVO', 'ESTADO'];
    this.datosReporte = [
      { a: '25/02/2026', b: 'Lab. Prog.', c: '08:00-10:00', d: 'Clase',  e: 'Estructuras de datos', estado: 'APROBADA'  },
      { a: '26/02/2026', b: 'Lab. Redes', c: '14:00-16:00', d: '—',      e: 'Taller routers',       estado: 'PENDIENTE' },
      { a: '27/02/2026', b: 'Lab. Prog.', c: '10:00-12:00', d: 'Examen', e: 'Evaluación final',     estado: 'CANCELADA' },
    ];
    this.mostrarEstadisticas = true;
  }

  private generarAsistencia(): void {
    this.statsModulo = [
      { icono: '👥', valor: '1,170', label: 'Total Registros', color: '#39ff14' },
      { icono: '📈', valor: '88%',   label: 'Tasa Promedio',   color: '#06b6d4' },
      { icono: '🏅', valor: 'Lab. IA', label: 'Mayor Asist.',  color: '#e67e22' },
      { icono: '📉', valor: 'Lab. BD', label: 'Menor Asist.',  color: '#e74c3c' },
    ];
    this.tituloGrafica1 = '% Asistencia por Laboratorio';
    this.tituloGrafica2 = 'Asistencia Mensual';
    this.datosGrafica = [
      { label: 'Lab. IA',    valor: 94, pct: 100 },
      { label: 'Lab. Prog.', valor: 92, pct: 98  },
      { label: 'Lab. Redes', valor: 87, pct: 93  },
      { label: 'Lab. SO',    valor: 81, pct: 86  },
      { label: 'Lab. BD',    valor: 78, pct: 83  },
    ];
    this.datosDistribucion = [
      { label: 'Asistió',     valor: 1170, pct: 88 },
      { label: 'No asistió',  valor: 160,  pct: 12 },
    ];
    this.columnasTabla = ['DOCENTE', 'LABORATORIO', 'FECHA', 'ASISTIERON', 'ESTADO'];
    this.datosReporte = [
      { a: 'María Torres', b: 'Lab. Prog.', c: '07/03/2026', d: '28/30', estado: '93%'  },
      { a: 'Carlos Vega',  b: 'Lab. Redes', c: '07/03/2026', d: '24/28', estado: '86%'  },
      { a: 'Luis Ponce',   b: 'Lab. IA',    c: '06/03/2026', d: '30/30', estado: '100%' },
    ];
    this.mostrarEstadisticas = true;
  }

  private generarAcademico(): void {
    this.statsModulo = [
      { icono: '📖', valor: 3,  label: 'Períodos',    color: '#f59e0b' },
      { icono: '🏫', valor: 5,  label: 'Carreras',    color: '#39ff14' },
      { icono: '📋', valor: 42, label: 'Asignaturas', color: '#3b82f6' },
      { icono: '🗓️', valor: 128, label: 'Horarios',   color: '#a855f7' },
    ];
    this.tituloGrafica1 = 'Asignaturas por Carrera';
    this.tituloGrafica2 = 'Distribución de Carreras';
    this.datosGrafica = [
      { label: 'Sistemas',  valor: 15, pct: 100 },
      { label: 'Civil',     valor: 10, pct: 67  },
      { label: 'Eléctrica', valor: 8,  pct: 53  },
      { label: 'Mecánica',  valor: 6,  pct: 40  },
      { label: 'Otras',     valor: 3,  pct: 20  },
    ];
    this.datosDistribucion = [
      { label: 'Sistemas',  valor: 120, pct: 32 },
      { label: 'Civil',     valor: 85,  pct: 23 },
      { label: 'Eléctrica', valor: 70,  pct: 19 },
      { label: 'Mecánica',  valor: 60,  pct: 16 },
      { label: 'Otras',     valor: 40,  pct: 10 },
    ];
    this.columnasTabla = ['ASIGNATURA', 'CARRERA', 'DOCENTE', 'LABORATORIO', 'ESTADO'];
    this.datosReporte = [
      { a: 'Redes I',    b: 'Sistemas',  c: 'María Torres', d: 'Lab. Redes', estado: 'ACTIVA'   },
      { a: 'BD I',       b: 'Sistemas',  c: 'Ana Mendoza',  d: 'Lab. BD',    estado: 'ACTIVA'   },
      { a: 'AutoCAD',    b: 'Civil',     c: 'Pedro Ríos',   d: 'Lab. Prog.', estado: 'ACTIVA'   },
      { a: 'Circuitos',  b: 'Eléctrica', c: 'Luis Ponce',   d: 'Lab. SO',    estado: 'INACTIVA' },
    ];
    this.mostrarEstadisticas = true;
  }

  private generarBloqueos(): void {
    this.statsModulo = [
      { icono: '🚫', valor: 18,   label: 'Total Bloqueos',  color: '#a855f7' },
      { icono: '🔒', valor: 5,    label: 'Activos',         color: '#e74c3c' },
      { icono: '🔓', valor: 13,   label: 'Liberados',       color: '#39ff14' },
      { icono: '⏳', valor: '2.4h', label: 'Duración Prom.', color: '#3b82f6' },
    ];
    this.tituloGrafica1 = 'Bloqueos por Laboratorio';
    this.tituloGrafica2 = 'Motivos de Bloqueo';
    this.datosGrafica = [
      { label: 'Lab. Prog.',  valor: 6, pct: 100 },
      { label: 'Lab. Redes',  valor: 4, pct: 67  },
      { label: 'Lab. BD',     valor: 3, pct: 50  },
      { label: 'Lab. SO',     valor: 3, pct: 50  },
      { label: 'Lab. IA',     valor: 2, pct: 33  },
    ];
    this.datosDistribucion = [
      { label: 'Mantenimiento',   valor: 8, pct: 44 },
      { label: 'Falla equipo',    valor: 5, pct: 28 },
      { label: 'Evento especial', valor: 3, pct: 17 },
      { label: 'Otros',           valor: 2, pct: 11 },
    ];
    this.columnasTabla = ['LABORATORIO', 'MOTIVO', 'FECHA', 'DURACIÓN', 'ESTADO'];
    this.datosReporte = [
      { a: 'Lab. Prog.',  b: 'Mantenimiento', c: '05/03/2026', d: '3h', estado: 'LIBERADO' },
      { a: 'Lab. Redes',  b: 'Falla equipo',  c: '06/03/2026', d: '5h', estado: 'ACTIVO'   },
      { a: 'Lab. BD',     b: 'Evento',        c: '07/03/2026', d: '2h', estado: 'ACTIVO'   },
    ];
    this.mostrarEstadisticas = true;
  }

  // ─── TABLA HELPER ──────────────────────────────────────────────────────────
  filasTabla(fila: any): string[] {
    // Devuelve valores en orden: a, b, c, d, e... y al final estado
    const vals: string[] = [];
    const keys = ['a','b','c','d','e','f'];
    for (const k of keys) {
      if (fila[k] !== undefined) vals.push(fila[k]);
    }
    vals.push(fila.estado ?? '');
    return vals;
  }

  getBadgeClass(estado: string): string {
    const e = (estado || '').toUpperCase();
    if (['COMPLETADA','OPERATIVO','ACTIVO','ACTIVA','APROBADA','LIBERADO','RESUELTO'].some(x => e.includes(x))) return 'badge-activo';
    if (['MANTENIMIENTO','PENDIENTE','EN PROCESO'].some(x => e.includes(x))) return 'badge-warning';
    if (e.match(/^\d+%$/)) return parseFloat(e) >= 85 ? 'badge-activo' : parseFloat(e) >= 70 ? 'badge-warning' : 'badge-inactivo';
    return 'badge-inactivo';
  }

  // ─── EXPORTAR ──────────────────────────────────────────────────────────────
  exportarPDF(): void {
    this.mostrarNotif('Exportando a PDF...');
    // TODO: conectar jsPDF o servicio backend
  }
  exportarExcel(): void {
    this.mostrarNotif('Exportando a Excel...');
    // TODO: conectar exportación Excel
  }

  // ─── TOAST ─────────────────────────────────────────────────────────────────
  mostrarNotif(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.mostrarToast = true;
    this.cdr.detectChanges();
    setTimeout(() => { this.mostrarToast = false; this.cdr.detectChanges(); }, 3000);
  }
}
