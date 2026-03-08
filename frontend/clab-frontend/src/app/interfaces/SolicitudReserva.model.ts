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
