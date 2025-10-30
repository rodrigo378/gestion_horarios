// aula.ts
export interface Aula {
    id: number;
    c_codaula: string;
    c_obs: string | null;
    n_capacidad: string;
    n_piso: number;
    pabellon: string;
}

export interface AulaReporte {
    id: number;
    c_codaula: string;
    n_piso: number;
    pabellon: string;
    n_capacidad: string;
    c_obs: string | null;
    Horario: HorarioAula[];
  }
  
  export interface HorarioAula {
    id: number;
    dia: string;
    h_inicio: string;
    h_fin: string;
    n_horas: number;
    c_color: string;
    tipo: string;
    aula_id: number;
    docente_id: number | null;
    curso_id: number;
    turno_id: number;
  
    // Nuevos objetos anidados
    Docente?: DocenteAula;
    curso: CursoAula;
  }
  
  export interface DocenteAula {
    id: number;
    categoria: string;
    c_nomdoc: string;
    h_min: number;
    h_max: number;
    tipo: number;
    h_total: number;
  }
  
  export interface CursoAula {
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
    c_codmod_equ: number;
    c_codfac_equ: string;
    c_codesp_equ: string;
    c_codcur_equ: string;
    c_nomcur_equ: string;
    turno_id: number;

    cursosPadres?: CursoPadreAula[]; 
  }
  
  export interface CursoPadreAula {
    id: number;
    curso_id: number;
    padre_curso_id: number;
    shortname: string;
    tipo: number; // 0 = transversal, 1 = agrupado
  }
  export interface AulaExtendido extends AulaReporte {
    expanded?: boolean;
  }
  
