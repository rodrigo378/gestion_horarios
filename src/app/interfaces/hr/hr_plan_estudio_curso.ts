import { HR_Curso } from './hr_curso';

export interface HR_Plan_Estudio_Curso {
  id: number;
  n_codper: number;
  c_codmod: number;
  c_codfac: string;
  c_codesp: string;
  c_codcur: string;
  c_nomcur: string;
  n_ciclo: number;
  n_ht: number;
  n_hp: number;
  c_area: string;
  c_curup: number;

  cursos?: HR_Curso[];
}
