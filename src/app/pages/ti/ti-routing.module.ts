import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from '../../common/layout/layout.component';
import { DocenteComponent } from './docente/docente.component';
import { PlanCursosComponent } from './plan-cursos/plan-cursos.component';
import { VerTurnoComponent } from './ver-turno/ver-turno.component';
import { GenerarCursosComponent } from './generar-cursos/generar-cursos.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'docente', component: DocenteComponent },
      { path: 'plan/curso', component: PlanCursosComponent },
      { path: 'turno', component: VerTurnoComponent },
      { path: 'generar/:turno_id', component: GenerarCursosComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TiRoutingModule {}
