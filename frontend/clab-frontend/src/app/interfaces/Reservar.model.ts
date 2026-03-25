

export interface Reserva {
  id_reserva: number;
  cod_laboratorio: number;
  nombre_laboratorio: string;
  fecha_reserva: string;
  fecha_solicitud: string;
  hora_inicio: string;
  hora_fin: string;
  id_asignatura: number;
  nombre_asignatura: string;
  id_periodo: number;
  nombre_periodo: string;
  numero_estudiantes: number;
  id_tipo_reserva: number;
  nombre_tipo: string;
  id_usuario: number;
  estado: 'Pendiente' | 'Aprobada' | 'Cancelada' | 'Completada' | 'Rechazada';
  descripcion: string;
  motivo: string;
}

export interface Cancelacion {
  id_reserva: number;
  id_usuario_cancela: number;
  fecha_cancelacion: string;
  motivo_cancelacion: string;
}

export interface TipoReserva {
  id_tipo_reserva: number;
  nombre_tipo: string;
  descripcion: string;
  estado: 'Activo' | 'Inactivo';
  requiereAsignatura: boolean | null;
}

export interface Laboratorio {
  cod_laboratorio: number;
  nombre: string;
}

export interface Asignatura {
  id_asignatura: number;
  nombre: string;
}

export interface Periodo {
  id_periodo: number;
  nombre_periodo: string;
}

export interface HorarioAcademico {
  id_horario_academico: number;
  nombre_asignatura: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  id_asignatura: number;
}

export interface Usuario {
  id_usuario: number;
  nombres: string;
  apellidos: string;
}
