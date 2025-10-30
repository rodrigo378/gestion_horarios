import { Core_Usuario } from '../core/core_usuario';

export interface HR_Usuario_Especialidad {
  id: number;
  c_codesp: string;

  usuario_id: number;
  usuario?: Core_Usuario;
}
