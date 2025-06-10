export interface Turno {
  id: number;
  n_codper: number;
  n_codpla: number;
  c_codfac: string;
  nom_fac: string;
  c_codesp: string;
  nomesp: string;
  c_grpcur: string;
  c_codmod: string;
  c_nommod: string;
  n_ciclo: number;
  estado: number;
  subido_sigu: boolean
  periodo?: {
    n_codper: number;
    f_cierre: string;
  };
  vencio: boolean;
}

export interface Periodo {
  n_codper: number;
  f_cierre: string;
}
