export interface Curso {
    n_codper: number;
    c_codmod: string;
    c_codfac: string;
    c_codesp: string;
    n_ciclo: string;
    c_ciclo: string;
    c_codcur: string;
    c_nomcur: string;
    n_ht?: number;
    n_hp?: number;
    tipo?: string;
    c_nommod: string;
    horasRestantes?: number
  }

export interface Especialidad {
  codfac: string;
  codesp: string;
  nomesp: string;
  estado: number;
  c_abrevesp: string;
}
  