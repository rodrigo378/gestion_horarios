import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from '../../common/layout/layout.component';
import { AsistenciaComponent } from './asistencia/asistencia.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [{ path: 'asistencia', component: AsistenciaComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocenteRoutingModule {}
