import { RolBD } from '../services/rol.service';

export interface Rol {
  idRol?: number;
  nombreRol: string;
  descripcion?: string;
  fechaCreacion: string;
}

export interface RolView {
  id?: number;
  nombre: string;
  descripcion?: string;
  fechaCreacion?: string;
  rolesBD?: RolBD[];
  estado?: string;
  modulosIds?: number[];
}

export interface RolRequest {
  nombreRol: string;
  descripcion?: string;
  permisos: number[];
}
