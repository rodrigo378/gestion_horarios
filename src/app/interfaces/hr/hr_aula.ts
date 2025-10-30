import { HR_Horario } from './hr_horario';

export interface HR_Aula {
  id: number;
  c_codaula: string;
  n_piso: number;
  pabellon: string;
  n_capacidad: string;
  c_obs?: string | null;
  ip?: string | null;
  id_aula_sigu?: string | null;

  horarios?: HR_Horario[];
}
