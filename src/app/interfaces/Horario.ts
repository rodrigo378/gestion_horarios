export interface getHorario{
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
}
export interface UpdateHorario {
  id: number;
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
}
