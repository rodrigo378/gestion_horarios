export interface User {
  id?: number;
  name: string;
  lastname: string;
  email: string;
  password: string;
}

export interface Usernew {
  // id?: string
  nombre: string | null;
  apellido: string | null;
  genero: string | null;
  grado: string | null;
  estado: string;
  email: string;
  authProvider: string;
}

export interface CreateUserDTO {
  nombre: string;
  apellido: string;
  genero: string;
  grado: string;
  email: string;
  password: string;
}