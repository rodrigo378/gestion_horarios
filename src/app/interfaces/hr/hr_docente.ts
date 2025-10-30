import { HR_Horario } from './hr_horario';

export interface HR_Docente {
  id: number;
  c_dnidoc: string;
  c_codfac: string;
  nom_fac: string;
  c_nomdoc: string;
  h_min: number;
  h_max: number;
  tipo: number;
  h_total: number;
  h_rectorado: number;
  v1: number;
  v2: number;
  id_funcion?: number | null;

  horarios?: HR_Horario[];

  expanded?: boolean;
}
