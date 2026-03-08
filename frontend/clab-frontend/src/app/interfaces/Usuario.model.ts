export interface Usuario {
  id?: number;
  identidad: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  usuario: string;
  contrasenia?: string;
  idsRoles?: number[];
  roles?: { idRol: number; nombreRol: string }[];
  rolNombre?: string;
  estado?: string;
  fechaRegistro?: string;
}
