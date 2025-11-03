import { HR_Grupo_Sincro } from './hr_grupo_sincro';
import { HR_Horario } from './hr_horario';
import { HR_Plan_Estudio_Curso } from './hr_plan_estudio_curso';
import { HR_Turno } from './hr_turno';

export interface HR_Curso {
  id: number;
  c_alu?: number | null;

  plan_id: number;
  plan?: HR_Plan_Estudio_Curso;

  turno_id: number;
  turno?: HR_Turno;

  horarios?: HR_Horario[];
  grupos_hijo?: HR_Grupo_Sincro[];
  grupos_padre?: HR_Grupo_Sincro[];
}
