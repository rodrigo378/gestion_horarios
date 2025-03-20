export interface Curso {
    nombre: string;
    horas: number;
    modalidad: number;
    tipoHoras: string;
}

export interface Especialidad {
    especialidad: string;
    c_codfac: string;
    cursos: Curso[];
    
}