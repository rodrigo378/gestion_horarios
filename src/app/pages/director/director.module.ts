import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DirectorRoutingModule } from './director-routing.module';
// import { AsignarHorarioDrComponent } from './asignar-horario-dr/asignar-horario-dr.component';
// import { CalenderDirectorComponent } from './calender-director/calender-director.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DirectorRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    FullCalendarModule,
  ],
})
export class DirectorModule {}
