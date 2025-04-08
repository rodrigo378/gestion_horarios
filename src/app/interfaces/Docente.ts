// docente.ts
// export interface Docente {
//     id: number;
//     c_coddoc: string;
//     c_nomdoc: string;
// }

export interface Docente {
    id: number;
    categoria: string;
    c_nomdoc: string;
    h_min: number;
    h_max: number;
    tipo: number;
    h_total: number;
    Horario: HorarioAsignado[];
}

//reporteria - Docente
export interface CursoAsignado {
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
}

export interface HorarioAsignado {
    id: number;
    dia: string;
    h_inicio: string;
    h_fin: string;
    n_horas: number;
    c_color: string;
    tipo: string;
    aula_id: number;
    docente_id: number;
    curso_id: number;
    turno_id: number;
    curso: CursoAsignado;
}

export interface DocenteExtendido extends Docente {
    expanded?: boolean;
}
