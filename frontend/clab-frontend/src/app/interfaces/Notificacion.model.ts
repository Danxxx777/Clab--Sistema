export interface Notificacion {
  idNotificacion: number;
  tipoNotificacion: string;
  asunto: string;
  mensaje: string;
  estado: string;
  fechaCreacion: string;
  fechaEnvio: string | null;
  emailOrigen: string | null;
  usuario: { idUsuario: number; nombres: string; email: string; };
}
