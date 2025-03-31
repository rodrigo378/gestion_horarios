import { Docente } from "./Docente";
import { Turno } from "./turno";

export interface HorarioExtendido {
  id: number;
  dia: string;
  h_inicio: string;
  h_fin: string;
  n_horas: number;
  c_color: string;
  aula_id: number | null;
  docente_id: number | null;
  curso_id: number;
  turno_id: number;
  curso: {
    id: number;
    n_codper: string;
    c_codmod: number;
    c_codfac: string;
    c_codesp: string;
    c_codcur: string;
    c_nomcur: string;
    n_ciclo: number;
    c_area: string;
    n_codper_equ: string;
    c_codmod_equ: string;
    c_codfac_equ: string;
    c_codesp_equ: string;
    c_codcur_equ: string;
    c_nomcur_equ: string;
    turno_id: number;
  };
}

//--------------Create----------------//
export interface CreateHorario {
  curso: {
    n_codper: string;
    c_codmod: number;
    c_codfac: string;
    c_codesp: string;
    c_codcur: string;
    c_nomcur: string;
    n_ciclo: number;
    c_area?: string;
    turno_id: number;

    n_codper_equ: string | null;
    c_codmod_equ: string | null;
    c_codfac_equ: string | null;
    c_codesp_equ: string | null;
    c_codcur_equ: string | null;
    c_nomcur_equ: string | null;
  };
  horarios: {
    id?: number;
    dia: string;
    h_inicio: string;
    h_fin: string;
    n_horas: number;
    c_color: string;
    aula_id: number;
    docente_id: number;
    turno_id: number;
  }[];
}

//---------------Update--------------------//
export interface UpdateHorarioData {
  dataArray: UpdateHorarioItem[];
}

export interface UpdateHorarioItem {
  curso: {
    n_codper: string;
    c_codmod: number;
    c_codfac: string;
    c_codesp: string;
    c_codcur: string;
    c_nomcur: string;
    n_ciclo: number;
    c_area: string;
    turno_id: number;
  };
  horarios: UpdateHorarioDetalle[];
}

export interface UpdateHorarioDetalle {
  id: number;
  dia: string;
  h_inicio: string;
  h_fin: string;
  n_horas: number;
  c_color: string;
  aula_id: number;
  docente_id: number;
  turno_id: number;
  }

export interface Horario {
  id?: number;
  c_codcur: string;
  c_nomcur: string;
  n_codper: string;
  dia: string;
  h_inicio: string;
  h_fin: string;
  n_horas: number;
  aula_id: number;
  c_color: string;
  c_coddoc: string;
  c_nomdoc: string;
  turno_id: number;
  turno: Turno;
  horario_padre_id: number;
  hijos: Horario[];
  docente_id: number;
  Docente: Docente;
}
//-----------Delete---------------
export interface DeleteHorariosRequest {
  horarios_id: number[];
}
