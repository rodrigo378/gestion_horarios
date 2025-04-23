export interface Turno {
  id: number;
  n_codper: number;
  n_codpla: number;
  c_codfac: string;
  nom_fac: string;
  c_codesp: string;
  nomesp: string;
  c_grpcur: string;
  c_codmod: string; // Cambiado a number
  c_nommod: string;
  n_ciclo: number;
  estado: number;
  f_cierre?: string;
  periodo?: {
    n_codper: number;
    f_cierre: string;
  };
}
