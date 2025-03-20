export interface Horario {
  id: string
  curso: string;
  dia: string;
  h_inicio: string;
  h_fin: string;
  color: string;
  docente: string;
  ciclo: string;
  seccion: string;
  carrera: string;
}
export interface CreateHorarioDto {
  horarios: Horario[];
}

