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
import { AsignarHorarioComponent } from './asignar-horario/asignar-horario.component';

// 🧩 NgZorro
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzFormModule } from 'ng-zorro-antd/form';

// Otros módulos externos
import { NgxApexchartsModule } from 'ngx-apexcharts';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    CalenderAulaComponent,
    CalenderDocenteComponent,
    ReporteriaComponent,
    ReporteriaAulaComponent,
    PisoPipe,
    VerTurnosComponent,
    AsignarHorarioComponent,
  ],
  imports: [
    CommonModule,
    DecanoRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    FullCalendarModule,

    // ✅ ng-zorro
    NzInputModule,
    NzAutocompleteModule,
    NzSelectModule,
    NzTableModule,
    NzPopconfirmModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzTagModule,
    NzPaginationModule,
    NzFormModule,

    // Otros
    NgxApexchartsModule,
    NgxPaginationModule,
  ],
})
export class DecanoModule {}
