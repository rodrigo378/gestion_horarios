import { HR_Curso } from './hr_curso';

export interface HR_Grupo_Sincro {
  id: number;
  curso_id: number;
  padre_curso_id: number;
  tipo: number;
  shortname: string;

  hijo?: HR_Curso;
  padre?: HR_Curso;
}
