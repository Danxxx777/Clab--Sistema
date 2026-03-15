// ─── INTERFACES BASE ──────────────────────────────────────────────────────────

export interface Laboratorio {
  codLaboratorio: number;
  nombreLab: string;
}

export interface ModuloConfig {
  id: string;
  titulo: string;
  desc: string;
  icono: string;
  color: string;
  colorHex: string;
}

export interface StatModulo {
  icono: string;
  valor: string | number;
  label: string;
  color: string;
}

export interface DatoGrafica {
  label: string;
  valor: number;
  pct: number;
}

// ─── INTERFACES DE EXPORTACIÓN (PDF y Excel) ──────────────────────────────────

export interface FiltrosExport {
  laboratorio: string;
  fechaInicio: string;
  fechaFin:    string;
  estado:      string;
}

export interface ExportOptions {
  modulo:            ModuloConfig;
  statsModulo:       StatModulo[];
  datosGrafica:      DatoGrafica[];
  datosDistribucion: DatoGrafica[];
  tituloGrafica1:    string;
  tituloGrafica2:    string;
  columnasTabla:     string[];
  datosReporte:      any[];
  filasTabla:        (fila: any) => string[];
  filtros:           FiltrosExport;
  nombreLaboratorio?: string;
  usuarioLogueado:   string;
}

// ─── FILTROS DE CONSULTA ──────────────────────────────────────────────────────

export interface FiltrosReporte {
  laboratorio?: string | number;
  fechaInicio?: string;   // YYYY-MM-DD
  fechaFin?:    string;   // YYYY-MM-DD
  estado?:      string;
  idUsuario?:   string | number;
}

// ─── INTERFACES DE RESPUESTA BACKEND ─────────────────────────────────────────

export interface ResumenGlobal {
  reservas:    number;
  asistencias: number;
  fallas:      number;
  estudiantes: number;
  equipos:     number;
  bloqueos:    number;
}

export interface ReporteResponse<T> {
  stats:    { [key: string]: string | number };
  grafica1: DatoGrafica[];
  grafica2: DatoGrafica[];
  datos:    T[];
}

// ─── INTERFACES DE DATOS POR MÓDULO ──────────────────────────────────────────

export interface ReporteUsoItem {
  laboratorio:    string;
  fecha:          string;
  horario:        string;
  numEstudiantes: number;
  estado:         string;
}

export interface ReporteEquipoItem {
  serie:       string;
  nombre:      string;
  tipo:        string;
  laboratorio: string;
  estado:      string;
}

export interface ReporteFallaItem {
  fecha:       string;
  laboratorio: string;
  equipo:      string;
  descripcion: string;
  estado:      string;
}

export interface ReporteUsuarioItem {
  identidad:      string;
  nombreCompleto: string;
  email:          string;
  usuario:        string;
  estado:         string;
}

export interface ReporteReservaItem {
  fecha:       string;
  laboratorio: string;
  horario:     string;
  tipo:        string;
  motivo:      string;
  estado:      string;
}

export interface ReporteAsistenciaItem {
  docente:     string;
  laboratorio: string;
  fecha:       string;
  asistieron:  string;
  porcentaje:  string;
}

export interface ReporteAcademicoItem {
  asignatura:  string;
  carrera:     string;
  docente:     string;
  laboratorio: string;
  estado:      string;
}

export interface ReporteBloqueosItem {
  laboratorio: string;
  tipo:        string;
  motivo:      string;
  fechaInicio: string;
  fechaFin:    string;
  fecha:       string;
  duracion:    string;
  estado:      string;
}
