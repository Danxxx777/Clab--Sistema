import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


interface Laboratorio {
  codLaboratorio: number;
  nombreLab: string;
}

interface TipoEquipo {
  id: number;
  nombre: string;
}

interface TipoReserva {
  id: number;
  nombre: string;
}

interface Usuario {
  idUsuario: number;
  identidad: string;
  nombres: string;
  apellidos: string;
  email: string;
  estado: string;
  fechaRegistro: string;
}

interface Equipo {
  idEquipo: number;
  numeroSerie: string;
  nombreEquipo: string;
  marca: string;
  modelo: string;
  tipoEquipo: TipoEquipo;
  estado: string;
  ubicacionFisica: string;
  laboratorio: Laboratorio;
  ultimoReporte: string;
}

interface ReporteFalla {
  idReporte: number;
  equipo: Equipo;
  laboratorio: Laboratorio;
  usuario: Usuario;
  descripcionFalla: string;
  fechaReporte: string;
}

interface Reserva {
  idReserva: number;
  laboratorio: Laboratorio;
  usuario: Usuario;
  tipoReserva: TipoReserva;
  fechaReserva: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  numeroEstudiantes: number;
  estado: string;
}



@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportar.html',
  styleUrls: ['./reportar.scss']
})
export class ReportarComponent implements OnInit {

  tabActiva = 0;
  busquedaRealizada = false;
  mostrarEstadisticas = false;

  filtros = {
    fechaInicio: '',
    fechaFin: '',
    laboratorio: '',
    estado: ''
  };

  laboratorios: Laboratorio[] = [];
  datosReporte: any[] = [];

  estadisticas = {
    // Uso de labs
    totalUsos: 0,
    horasTotales: 0,
    labMasUsado: '-',
    totalEstudiantes: 0,
    // Equipos
    totalEquipos: 0,
    equiposOperativos: 0,
    equiposMantenimiento: 0,
    equiposFuera: 0
  };

  mostrarToast = false;
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.inicializarFechas();
    this.cargarLaboratorios();
  }

  inicializarFechas(): void {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    this.filtros.fechaInicio = hace30Dias.toISOString().split('T')[0];
    this.filtros.fechaFin = hoy.toISOString().split('T')[0];
  }

  cargarLaboratorios(): void {
    // TODO: this.laboratorioService.listar().subscribe(data => this.laboratorios = data);
    this.laboratorios = [];
  }

  cambiarTab(tab: number): void {
    this.tabActiva = tab;
    this.datosReporte = [];
    this.busquedaRealizada = false;
    this.mostrarEstadisticas = false;
    this.limpiarFiltros();
  }

  aplicarFiltros(): void {
    if (this.filtros.fechaInicio && this.filtros.fechaFin) {
      if (this.filtros.fechaInicio > this.filtros.fechaFin) {
        this.mostrarNotificacion('La fecha de inicio no puede ser mayor a la fecha fin', 'error');
        return;
      }
    }

    this.busquedaRealizada = true;

    switch (this.tabActiva) {
      case 0: this.generarReporteUso(); break;
      case 1: this.generarReporteEquipos(); break;
      case 2: this.generarReporteFallas(); break;
      case 3: this.generarReporteUsuarios(); break;
      case 4: this.generarReporteReservas(); break;
    }
  }

  // ── TAB 0: Uso de laboratorios (campos de Reserva relevantes) ──
  generarReporteUso(): void {
    // TODO: this.reporteService.usoLaboratorios(this.filtros).subscribe(...)

    // Datos de ejemplo alineados con Reserva
    this.datosReporte = [
      {
        laboratorio: { nombreLab: 'Lab. Programación' },
        fechaReserva: new Date('2025-02-20'),
        horaInicio: '08:00',
        horaFin: '10:00',
        numeroEstudiantes: 28,
        estado: 'COMPLETADA'
      },
      {
        laboratorio: { nombreLab: 'Lab. Redes' },
        fechaReserva: new Date('2025-02-21'),
        horaInicio: '14:00',
        horaFin: '16:00',
        numeroEstudiantes: 22,
        estado: 'COMPLETADA'
      }
    ];

    this.estadisticas = {
      ...this.estadisticas,
      totalUsos: 45,
      horasTotales: 90,
      labMasUsado: 'Lab. Programación',
      totalEstudiantes: 520
    };

    this.mostrarEstadisticas = true;
    this.mostrarNotificacion('✅ Reporte generado correctamente');
  }

  // ── TAB 1: Equipos (campos de Equipo) ──
  generarReporteEquipos(): void {
    // TODO: this.equipoService.reporte(this.filtros).subscribe(...)

    this.datosReporte = [
      {
        numeroSerie: 'PC-001',
        nombreEquipo: 'Computadora Dell',
        tipoEquipo: { nombre: 'Computadora' },
        laboratorio: { nombreLab: 'Lab. Programación' },
        estado: 'OPERATIVO',
        ultimoReporte: new Date('2025-02-15')
      },
      {
        numeroSerie: 'SW-005',
        nombreEquipo: 'Switch Cisco',
        tipoEquipo: { nombre: 'Networking' },
        laboratorio: { nombreLab: 'Lab. Redes' },
        estado: 'MANTENIMIENTO',
        ultimoReporte: new Date('2025-02-20')
      },
      {
        numeroSerie: 'PC-007',
        nombreEquipo: 'Computadora HP',
        tipoEquipo: { nombre: 'Computadora' },
        laboratorio: { nombreLab: 'Lab. Redes' },
        estado: 'FUERA',
        ultimoReporte: new Date('2025-02-10')
      }
    ];

    this.estadisticas = {
      ...this.estadisticas,
      totalEquipos: 50,
      equiposOperativos: 42,
      equiposMantenimiento: 6,
      equiposFuera: 2
    };

    this.mostrarEstadisticas = true;
    this.mostrarNotificacion('✅ Reporte generado correctamente');
  }

  // ── TAB 2: Fallas (campos de ReporteFallas) ──
  generarReporteFallas(): void {
    // TODO: this.fallaService.reporte(this.filtros).subscribe(...)

    this.datosReporte = [
      {
        fechaReporte: new Date('2025-02-20'),
        laboratorio: { nombreLab: 'Lab. Programación' },
        equipo: { nombreEquipo: 'Computadora Dell PC-001' },
        descripcionFalla: 'No enciende la pantalla al iniciar',
        usuario: { nombres: 'Juan', apellidos: 'Pérez' }
      },
      {
        fechaReporte: new Date('2025-02-21'),
        laboratorio: { nombreLab: 'Lab. Redes' },
        equipo: { nombreEquipo: 'Switch Cisco SW-005' },
        descripcionFalla: 'Presenta intermitencias en la conexión',
        usuario: { nombres: 'María', apellidos: 'García' }
      }
    ];

    this.mostrarEstadisticas = false;
    this.mostrarNotificacion('✅ Reporte generado correctamente');
  }

  // ── TAB 3: Usuarios (campos de Usuario) ──
  generarReporteUsuarios(): void {
    // TODO: this.usuarioService.reporte(this.filtros).subscribe(...)

    this.datosReporte = [
      {
        identidad: '0923456789',
        nombres: 'Juan',
        apellidos: 'Pérez González',
        email: 'juan.perez@universidad.edu.ec',
        estado: 'ACTIVO',
        fechaRegistro: new Date('2024-01-15')
      },
      {
        identidad: '0987654321',
        nombres: 'María',
        apellidos: 'García López',
        email: 'maria.garcia@universidad.edu.ec',
        estado: 'ACTIVO',
        fechaRegistro: new Date('2024-02-10')
      },
      {
        identidad: '0912345678',
        nombres: 'Carlos',
        apellidos: 'Torres Mora',
        email: 'carlos.torres@universidad.edu.ec',
        estado: 'INACTIVO',
        fechaRegistro: new Date('2023-09-01')
      }
    ];

    this.mostrarEstadisticas = false;
    this.mostrarNotificacion('✅ Reporte generado correctamente');
  }

  // ── TAB 4: Reservas (campos de Reserva) ──
  generarReporteReservas(): void {
    // TODO: this.reservaService.reporte(this.filtros).subscribe(...)

    this.datosReporte = [
      {
        laboratorio: { nombreLab: 'Lab. Programación' },
        fechaReserva: new Date('2025-02-25'),
        horaInicio: '08:00',
        horaFin: '10:00',
        tipoReserva: { nombre: 'Clase' },
        motivo: 'Práctica de estructuras de datos',
        estado: 'APROBADA'
      },
      {
        laboratorio: { nombreLab: 'Lab. Redes' },
        fechaReserva: new Date('2025-02-26'),
        horaInicio: '14:00',
        horaFin: '16:00',
        tipoReserva: null,
        motivo: 'Taller de configuración de routers',
        estado: 'PENDIENTE'
      },
      {
        laboratorio: { nombreLab: 'Lab. Programación' },
        fechaReserva: new Date('2025-02-27'),
        horaInicio: '10:00',
        horaFin: '12:00',
        tipoReserva: { nombre: 'Examen' },
        motivo: 'Evaluación final',
        estado: 'CANCELADA'
      }
    ];

    this.mostrarEstadisticas = false;
    this.mostrarNotificacion('✅ Reporte generado correctamente');
  }

  limpiarFiltros(): void {
    this.inicializarFechas();
    this.filtros.laboratorio = '';
    this.filtros.estado = '';
    this.datosReporte = [];
    this.busquedaRealizada = false;
    this.mostrarEstadisticas = false;
  }

  exportarPDF(): void {
    // TODO: implementar exportación real
    this.mostrarNotificacion('📄 Exportando a PDF...');
    setTimeout(() => {
      this.mostrarNotificacion('✅ PDF generado exitosamente');
    }, 1500);
  }

  getBadgeClass(estado: string): string {
    const e = estado?.toLowerCase() || '';
    if (['operativo', 'activo', 'aprobada', 'completada'].includes(e)) return 'badge-activo';
    if (['mantenimiento', 'pendiente'].includes(e)) return 'badge-mantenimiento';
    return 'badge-inactivo'; // inactivo, fuera, cancelada
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

  volver(): void {
    this.router.navigate(['/dashboard']);
  }
}
