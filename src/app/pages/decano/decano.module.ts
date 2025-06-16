import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DecanoRoutingModule } from './decano-routing.module';
import { AgruparCursosComponent } from './agrupar-cursos/agrupar-cursos.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalenderAulaComponent } from './calender-aula/calender-aula.component';
import { CalenderDocenteComponent } from './calender-docente/calender-docente.component';
import { ReporteriaComponent } from './reporteria/reporteria.component';
import { ReporteriaAulaComponent } from './reporteria-aula/reporteria-aula.component';
import { VerCursosComponent } from './ver-cursos/ver-cursos.component';
import { VerTransversalComponent } from './ver-transversal/ver-transversal.component';
import { VerTurnosComponent } from './ver-turnos/ver-turnos.component';
import { AsignarhorarioComponent } from './asignar-horario/asignarhorario.component';
import { PisoPipe } from '../../piso.pipe';

@NgModule({
  declarations: [
    AgruparCursosComponent,
    AsignarhorarioComponent,
    CalenderAulaComponent,
    CalenderDocenteComponent,
    ReporteriaComponent,
    ReporteriaAulaComponent,
    VerCursosComponent,
    VerTransversalComponent,
    VerTurnosComponent,
    PisoPipe,
  ],
  imports: [
    CommonModule,
    DecanoRoutingModule,
    FormsModule,
    FullCalendarModule,
    ReactiveFormsModule,
  ],
})
export class DecanoModule {}
