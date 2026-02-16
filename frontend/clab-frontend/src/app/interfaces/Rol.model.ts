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
  fechaCreacion: string;
}
export interface RolRequest {
  nombreRol: string;
  descripcion?: string;
  permisos: number[];
}
