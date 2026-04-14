import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from '../../common/layout/layout.component';
import { DocenteComponent } from './docente/docente.component';
import { PlanCursosComponent } from './plan-cursos/plan-cursos.component';
import { VerTurnoComponent } from './ver-turno/ver-turno.component';
import { GenerarCursosComponent } from './generar-cursos/generar-cursos.component';
import { AsignarHorarioComponent } from './asignar-horario/asignar-horario.component';
import { ContadorComponent } from './contador/contador.component';
import { SincronizarComponent } from './sincronizar/sincronizar.component';
import { CrearMoodleComponent } from './crear-moodle/crear-moodle.component';
import { AulaComponent } from './aula/aula.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'docente', component: DocenteComponent },
      { path: 'plan-estudio', component: PlanCursosComponent },
      { path: 'turno', component: VerTurnoComponent },
      { path: 'generar/:turno_id', component: GenerarCursosComponent },
      { path: 'asignar/:turno_id', component: AsignarHorarioComponent },
      { path: 'contador', component: ContadorComponent },
      // { path: 'vacantes', component: CrearMoodleComponent },
      { path: 'vacantes', component: AulaComponent },
      { path: 'sinc', component: SincronizarComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TiRoutingModule {}
