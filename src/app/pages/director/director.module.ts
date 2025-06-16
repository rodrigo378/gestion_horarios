import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DirectorRoutingModule } from './director-routing.module';
import { AsignarHorarioDrComponent } from './asignar-horario-dr/asignar-horario-dr.component';
import { CalenderDirectorComponent } from './calender-director/calender-director.component';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';

@NgModule({
  declarations: [AsignarHorarioDrComponent, CalenderDirectorComponent],
  imports: [
    CommonModule,
    DirectorRoutingModule,
    FormsModule,
    FullCalendarModule,
  ],
})
export class DirectorModule {}
