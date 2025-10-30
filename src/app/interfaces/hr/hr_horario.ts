import { HR_Aula } from './hr_aula';
import { HR_Curso } from './hr_curso';
import { HR_Docente } from './hr_docente';
import { HR_Turno } from './hr_turno';

export interface HR_Horario {
  id: number;
  dia?: string | null;
  h_inicio?: Date | null;
  h_fin?: Date | null;
  n_horas: number;
  c_color?: string | null;
  tipo: string;
  h_umaPlus?: number | null;
  modalidad: string;

  aula_id?: number | null;
  docente_id?: number | null;
  curso_id: number;
  turno_id: number;

  aula?: HR_Aula | null;
  docente?: HR_Docente | null;
  curso?: HR_Curso;
  turno?: HR_Turno;
}
