import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from '../../common/layout/layout.component';
import { ReporteriaComponent } from '../decano/reporteria/reporteria.component';
// import { AsignarHorarioDrComponent } from './asignar-horario-dr/asignar-horario-dr.component';
import { CalenderDocenteComponent } from '../decano/calender-docente/calender-docente.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      // { path: 'turno', component: VerTurnosComponent },
      { path: 'docente', component: ReporteriaComponent },
      // { path: 'calender_turno', component: CalenderDirectorComponent },
      // { path: 'asignarhorario', component: AsignarHorarioDrComponent },
      // { path: 'calendario_docente', component: CalenderDocenteComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DirectorRoutingModule {}
