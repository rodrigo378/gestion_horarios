import { Core_Usuario } from './core_usuario';

export interface Core_Rol {
  id: number;
  nombre: string;
  usuario?: Core_Usuario[];
}
