import { RolBD } from '../services/rol.service';

export interface Rol {
  idRol?: number;
  nombreRol: string;
  descripcion?: string;
  fechaCreacion: string; // LocalDate llega como ISO string
}

export interface RolView {
  id?: number;
  nombre: string;
  descripcion?: string;
  fechaCreacion?: string;
  rolesBD?: RolBD[];  // ← cambio
}
export interface RolRequest {
  nombreRol: string;
  descripcion?: string;
  permisos: number[];
}
