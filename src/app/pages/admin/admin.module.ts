import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { ListarUsuariosComponent } from './listar-usuarios/listar-usuarios.component';
import { PermisosUsuariosComponent } from './permisos-usuarios/permisos-usuarios.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ListarUsuariosComponent, PermisosUsuariosComponent],
  imports: [CommonModule, AdminRoutingModule, FormsModule],
})
export class AdminModule {}
