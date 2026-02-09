export interface Usuario {
  id?: number;
  identidad: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  usuario: string;
  contrasenia?: string;
  idRol?: number;
  rolNombre?: string;
  estado?: string;//a
  fechaRegistro?: string;
}
