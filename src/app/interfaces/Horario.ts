import { Docente } from './Docente';
import { Turno } from './turno';

export interface getHorario {
  id: number;
  c_codcur: string;
  c_nomcur: string;
  dia: string;
  h_inicio: string;
  h_fin: string;
  n_horas: number;
  aula_id: number;
  c_color: string;
  c_coddoc: string;
  c_nomdoc: string;
  turno_id: number;
}
export interface CreateHorario {
  n_codper: string;
  c_codcur: string;
  c_nomcur: string;
  dia: string;
  h_inicio: string;
  h_fin: string;
  n_horas: number;
  c_color: string;
  c_coddoc: string;
  c_nomdoc: string;
  turno_id: number;

  n_aulo?: string;
  aforo?: number;
}
export interface UpdateHorario {
  id: number;
  n_codper: string;
  c_codcur: string;
  c_nomcur: string;
  dia: string;
  h_inicio: string;
  h_fin: string;
  n_horas: number;
  c_color: string;
  c_coddoc: string;
  c_nomdoc: string;
  turno_id: number;
  n_aulo?: string;
  aforo?: number;
  aula_id?: number;
  docente_id?: number;
}

export interface Horario {
  id?: number;
  c_codcur: string;
  c_nomcur: string;
  n_codper: string;
  dia: string;
  h_inicio: string;
  h_fin: string;
  n_horas: number;
  aula_id: number;
  c_color: string;
  c_coddoc: string;
  c_nomdoc: string;
  turno_id: number;
  turno: Turno;
  horario_padre_id: number;
  hijos: Horario[];
  docente_id: number;
  Docente?: Docente;
}
