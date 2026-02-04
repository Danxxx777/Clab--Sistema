export interface Rol {
  idRol?: number;
  nombreRol: string;
  descripcion?: string;
  fechaCreacion: string; // LocalDate llega como ISO string
}
