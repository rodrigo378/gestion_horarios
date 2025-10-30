export interface item {
  id: number;
  moduloId: number;
  nombre: string;
  codigo: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Modulo {
  id: number;
  nombre: string;
  codigo: string;
  icono: string;
  estado: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  Item: item[];
}
