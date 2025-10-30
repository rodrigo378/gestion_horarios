import { Core_Rol } from './core_rol';

export interface Core_Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  grado: string;
  estado: string;

  rol_id: number;
  rol?: Core_Rol;

  azure_oid?: string | null;
  email: string;
  lastLoginAt?: string | null;

  perfil_global?: Record<string, unknown> | null;

  createdAt: string;
  updatedAt: string;
}
