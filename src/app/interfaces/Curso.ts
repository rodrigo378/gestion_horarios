import { Aula } from './Aula';
import { Docente } from './Docente';
import { Horario } from './Horario';

export interface Curso {
  n_codper: number;
  c_codmod: string;
  c_nommod: string;
  c_codfac: string;
  c_codesp: string;
  c_area?: string;
  c_nom_cur_area?: string;
  n_ciclo: string;
  c_ciclo: string;
  c_codcur: string;
  c_nomcur: string;
  n_ht?: number;
  n_hp?: number;
  tipo?: string;
  horasRestantes?: number;
  vacante?: number;

  // equivalencias
  n_codper_equ?: number;
  c_codmod_equ?: string;
  c_codfac_equ?: string;
  c_codesp_equ?: string;
  c_codcur_equ?: string;
  c_nomcur_equ?: string;
  disabled?: boolean;
}

export interface Especialidad {
  codfac: string;
  codesp: string;
  nomesp: string;
  estado: number;
  c_abrevesp: string;
}

//////////////////
export interface Curso2 {
  id: number;
  n_codper: string;
  c_codmod: number;
  c_codfac: string;
  c_codesp: string;
  c_codcur: string;
  c_nomcur: string;
  n_ciclo: number;
  c_area: string;
  n_codper_equ?: string;
  c_codmod_equ?: string;
  c_codfac_equ?: string;
  c_codesp_equ?: string;
  c_codcur_equ?: string;
  c_nomcur_equ?: string;
  turno_id: number;
  Horario: Horario[];
}
