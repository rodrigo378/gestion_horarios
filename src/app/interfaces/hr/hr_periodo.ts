import { HR_Turno } from './hr_turno';

export interface HR_Periodo {
  n_codper: number;
  f_cierre: Date;

  turnos?: HR_Turno[];
}
