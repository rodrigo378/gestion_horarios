export interface HR_Contador {
  id: number | null;
  courseId: number | null;
  limite: number | null;
  ejecutado: boolean | null;
  ejecutado_at: Date | string | null;
}

export interface ContadorResultBase {
  courseid_temp: string;
  datos: string;
  c_codfac: string;
  c_codesp: string;
  c_codcur: string;
  c_nomcur: string;
  total_grupos: number;
  secciones: string;
  total_vacantes_max: number | string;
  total_vacantes_tot: number;
  total_vacantes_matriculados: number;
  n_ciclo: number;
  c_codmod: string;
  n_codpla: string;
}

export interface ContadorResult extends ContadorResultBase, HR_Contador {}
