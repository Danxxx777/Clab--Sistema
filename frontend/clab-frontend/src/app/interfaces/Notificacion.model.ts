export interface Notificacion {
  idNotificacion: number;
  tipoNotificacion: string;
  asunto: string;
  mensaje: string;
  estado: string;
  fechaCreacion: string;
  fechaEnvio: string | null;
  emailOrigen: string | null;
  canal: string | null;
  rolDestino: string | null;
  usuario: { idUsuario: number; nombres: string; email: string; };
}
