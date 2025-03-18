export interface Curso {
    c_ciclo: string;
}

export interface Especialidad {
    especialidad: string;
    c_codfac: string;
    cursos: Curso[];
}