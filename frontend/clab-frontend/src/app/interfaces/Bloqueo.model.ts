export interface Bloqueo {
  idBloqueo: number;
  codLaboratorio: number;
  nombreLaboratorio: string;
  idUsuario: number;
  nombreUsuario: string;
  idTipoBloqueo: number;
  nombreTipoBloqueo: string;
  motivo: string;
  fechaInicio: string;
  fechaFin: string;
  afectaReservasExistentes: boolean;
  estado: string;
}
