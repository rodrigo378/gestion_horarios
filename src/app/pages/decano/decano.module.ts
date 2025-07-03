import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DecanoRoutingModule } from './decano-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalenderAulaComponent } from './calender-aula/calender-aula.component';
import { CalenderDocenteComponent } from './calender-docente/calender-docente.component';
import { ReporteriaComponent } from './reporteria/reporteria.component';
import { ReporteriaAulaComponent } from './reporteria-aula/reporteria-aula.component';
import { PisoPipe } from '../../piso.pipe';
import { VerTurnosComponent } from './ver-turnos/ver-turnos.component';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NgxApexchartsModule } from 'ngx-apexcharts';
import { NgxPaginationModule } from 'ngx-pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { AsignarHorarioComponent } from './asignar-horario/asignar-horario.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
@NgModule({
  declarations: [
    // AgruparCursosComponent,
    CalenderAulaComponent,
    CalenderDocenteComponent,
    ReporteriaComponent,
    ReporteriaAulaComponent,
    // VerCursosComponent,
    // VerTransversalComponent,
    PisoPipe,
    VerTurnosComponent,
    AsignarHorarioComponent,
  ],
  imports: [
    CommonModule,
    DecanoRoutingModule,
    FormsModule,
    FullCalendarModule,
    ReactiveFormsModule,

    // ng-zorro
    NzPopconfirmModule,
    NzTableModule,
    NzSelectModule,
    NgxPaginationModule,
    NgxApexchartsModule,
    NzAutocompleteModule,
    NzInputModule,
    NzGridModule,
  ],
})
export class DecanoModule {}
