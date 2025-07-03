import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from '../../common/layout/layout.component';
import { MarcarAsistenciaComponent } from './marcar-asistencia/marcar-asistencia.component';
import { VerAsistenciaComponent } from './ver-asistencia/ver-asistencia.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'marcar', component: MarcarAsistenciaComponent },
      { path: 'ver-asistencia', component: VerAsistenciaComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocenteRoutingModule {}
