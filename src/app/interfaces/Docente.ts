// docente.ts
export interface Docente {
    id: number;
    c_coddoc: string;
    c_nomdoc: string;
}

export interface docenten {
    id: number;
    categoria: string;
    c_nomdoc: string;
    h_min: number;
    h_max: number;
    tipo: number;
    h_total: number;
}
