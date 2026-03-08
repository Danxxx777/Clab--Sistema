export interface Equipo {
  id: number;
  noSerie: string;
  nombre: string;
  marca: string;
  modelo: string;
  idTipoEquipo: number;
  nombreTipoEquipo: string;
  codLaboratorio: number;
  nombreLaboratorio: string;
  estado: string;
  fechaAdquisicion: string;
  ubicacionFisica: string;
}

export interface TipoEquipo {
  id: number;
  nombre: string;
  descripcion: string;
}
