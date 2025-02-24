export interface Docente {
  id?: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  fecha_nacimiento: string;
  email: string;
  celular: string;
  telefono_fijo: string;
  estado: string; // 0 default

  contactoEmergencia: ContactoEmergencia;

  domicilio: Domicilio;

  formacionAcademica: FormacionAcademica[];

  titulosProfesionales: TitulosProfesionales[];

  formacionComplementaria: FormacionComplementaria[];

  experienciaDocente: ExperienciaDocente[];

  articuloCientifico: ArticuloCientifico[];

  libros: Libro[];

  proyectoInvestigacion: ProyectoInvestigacion[];

  asesoriaJurado: AsesoriaJurado[];

  otros: Otro[];
}

export interface ContactoEmergencia {
  id?: number;
  nombre: string;
  relacion: string; // Padre/Madre, Hermano/a, Amigo/a, Pareja u Otro
  telefono_1: string;
  telefono_2: string;

  docente_id: number;
}

export interface Domicilio {
  id?: number;
  departamento_id: number;
  provincia_id: number;
  distrito_id: number;

  direccion: string;
  referencia: string;
  mz: string;
  lote: string;

  docente_id: number;
}

export interface FormacionAcademica {
  id?: number;
  grado_academico: string; // Bachiller, Magister, Doctor
  universidad: string;
  especialidad: string;
  pais: string;
  resolucion_sunedu: string; // Número de resolución en caso de revalidación

  docente_id: number;
}

export interface TitulosProfesionales {
  id?: number;
  titulo: string;
  universidad: string;
  especialidad: string;

  docente_id: number;
}

export interface FormacionComplementaria {
  id?: number;

  denominacion: string;
  especialidad: string;
  institucion: string;

  docente_id: number;
}

export interface ExperienciaDocente {
  id?: number;

  institucion: string;
  curso_dictado: string;
  semestre: string;
  pais: string;
  tipo_experiencia: number; // 0 => Universitario, 1 => no_universitario

  docente_id: number;
}

export interface ArticuloCientifico {
  id?: number;

  titulo_articulo: string;
  nombre_revista: string;
  indizado: string;
  año: string;
  enlace: string;

  docente_id: number;
}

export interface Libro {
  id?: number;

  titulo: string;
  nombre_editorial: string;
  año: string;

  docente_id: number;
}

export interface ProyectoInvestigacion {
  id?: number;

  nombre: string;
  entidad_financiadora: string;
  año: string;

  docente_id: number;
}

export interface AsesoriaJurado {
  id?: number;

  titulo_tesis: string;
  universidad: string;
  nivel: string;
  año: string;
  tipo: number; // 0 => Asesor, 1 => Jurado

  docente_id: number;
}

export interface Otro {
  id?: number;

  idioma: string;
  nivel_idioma: string;
  office: string;
  nivel_office: string;
  elearning: string;
  nivel_elearning: string;

  docente_id: number;
}
