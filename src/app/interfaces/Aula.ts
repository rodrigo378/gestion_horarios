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
    h_inicio: string;   // formato ISO
    h_fin: string;      // formato ISO
    n_horas: number;
    c_color: string;
    tipo: string;       // 'Teoría' o 'Práctica'
    aula_id: number;
    docente_id: number | null;
    curso_id: number;
    turno_id: number;
}

export interface AulaExtendido extends AulaReporte {
    expanded?: boolean;
}
