import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from '../../common/layout/layout.component';
import { PeriodoComponent } from '../ti/periodo/periodo.component';
import { ReporteriaComponent } from './reporteria/reporteria.component';
import { ReporteriaAulaComponent } from './reporteria-aula/reporteria-aula.component';
// import { VerCursosComponent } from './ver-cursos/ver-cursos.component';
// import { AgruparCursosComponent } from './agrupar-cursos/agrupar-cursos.component';
// import { VerTransversalComponent } from './ver-transversal/ver-transversal.component';
import { CalenderAulaComponent } from './calender-aula/calender-aula.component';
// import { CalenderDirectorComponent } from '../director/calender-director/calender-director.component';
import { CalenderDocenteComponent } from './calender-docente/calender-docente.component';
import { VerTurnosComponent } from './ver-turnos/ver-turnos.component';
import { AsignarHorarioComponent } from './asignar-horario/asignar-horario.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'periodo', component: PeriodoComponent },
      { path: 'turno', component: VerTurnosComponent },
      { path: 'docente', component: ReporteriaComponent },
      { path: 'aula', component: ReporteriaAulaComponent },
      // { path: 'cursos/:id', component: VerCursosComponent },
      // { path: 'agrupar', component: AgruparCursosComponent },
      // { path: 'transversal', component: VerTransversalComponent },
      { path: 'calendario_aula', component: CalenderAulaComponent },
      { path: 'asignar/:turno_id', component: AsignarHorarioComponent },
      // { path: 'calender_turno', component: CalenderDirectorComponent },
      { path: 'calendario_docente', component: CalenderDocenteComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DecanoRoutingModule {}
