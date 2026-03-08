// ─── INTERFACES ───────────────────────────────────────────────────────────────
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
