export interface Auditoria {
  usuario: string;
  accion: string;
  modulo: string;
  fecha: string;
}
export interface AuditoriaItem {
  idAuditoria?: number;
  idUsuario?: number;
  usuario?: string;
  accion: string;
  modulo?: string;
  tablaAfectada?: string;
  descripcion?: string;
  ip?: string;
  resultado?: string;
  fechaHora?: string;
  datosAnteriores?: string;
  datosNuevos?: string;
}

export interface SesionActivaItem {
  idSesion?: number;
  idUsuario?: number;
  usuario: string;
  ip?: string;
  fechaInicio?: string;
  fechaExpira?: string;
  activa?: boolean;
}
