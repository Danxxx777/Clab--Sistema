export interface Usuario {
  id?: number;
  identidad: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  usuario: string;
  contrasenia?: string;
  idsRoles?: number[];        // 👈 antes idRol
  roles?: { idRol: number; nombreRol: string }[];
  rolNombre?: string;         // se mantiene para mostrar en tabla (primer rol)
  estado?: string;
  fechaRegistro?: string;
}
