export interface Laboratorio {
  codLaboratorio?: number;
  cod_laboratorio?: number;
  nombreLab?: string;
  nombre?: string;
  ubicacion: string;
  capacidadEstudiantes?: number;
  capacidad_estudiantes?: number;
  numeroEquipos?: number;
  numero_equipos?: number;
  descripcion: string;
  estadoLab?: string;
  estado_lab?: 'Disponible' | 'Mantenimiento' | 'Bloqueado';
  idSede?: number;
  id_sede?: number;
  sede?: { idSede: number; nombre: string; };
  nombreSede?: string;
  nombre_sede?: string;
  encargadoNombre?: string;
  encargado_nombre?: string;
  foto?: string;
}

export interface Sede {
  idSede: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  estado: string;
}

export interface EncargadoLaboratorio {
  idEncargadoLaboratorio?: number;
  id_encargado_laboratorio: number;
  cod_laboratorio: number;
  id_usuario: number;
  fecha_asignacion: Date | string;
  vigente: boolean;
  identidad?: string;
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  nombreLab?: string;
}
