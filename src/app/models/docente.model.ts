export interface Docente {
  // Información Personal
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  fecha_nacimiento: string;
  email: string;
  celular: string;
  telefono_fijo: string;

  // Contacto de Emergencia
  nombre_emergencia: string;
  relacion_emergencia: string;
  telefono_emergencia: string;
  telefono_emergencia2?: string;

  // Domicilio
  departamento_id: number;
  provincia_id: number;
  distrito_id: number;
  direccion: string;
  referencia: string;
  mz: string;
  lote: string;

  // Formación Académica (Lista)
  formacionAcademica: FormacionAcademica[];

  // Experiencia Docente (Lista)
  experienciaDocente: ExperienciaDocente[];

}

// Submodelo: Formación Académica
export interface FormacionAcademica {
  grado_academico: string;
  universidad: string;
  especialidad: string;
  pais: string;
  revalidacion: string;
}

// Submodelo: Experiencia Docente
export interface ExperienciaDocente {
  institucion: string;
  curso_dictado: string;
  semestre: string;
  pais: string;
}
