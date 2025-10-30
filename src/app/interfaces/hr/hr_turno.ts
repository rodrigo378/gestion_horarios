import { HR_Curso } from './hr_curso';
import { HR_Horario } from './hr_horario';
import { HR_Periodo } from './hr_periodo';

export interface HR_Turno {
  id: number;
  n_codper: number;
  n_codpla: number;
  c_codfac: string;
  nom_fac: string;
  c_codesp: string;
  nomesp: string;
  c_grpcur: string;
  c_codmod: number;
  c_nommod: string;
  n_ciclo: number;
  estado: number;
  subido_sigu: boolean;

  periodo?: HR_Periodo;
  cursos?: HR_Curso[];
  horarios?: HR_Horario[];
}
