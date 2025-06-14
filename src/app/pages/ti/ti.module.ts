import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TiRoutingModule } from './ti-routing.module';

// ng-zorro
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NgxPaginationModule } from 'ngx-pagination';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NgxApexchartsModule } from 'ngx-apexcharts';
import { DocenteComponent } from './docente/docente.component';
import { FormsModule } from '@angular/forms';
import { PlanCursosComponent } from './plan-cursos/plan-cursos.component';
import { VerTurnoComponent } from './ver-turno/ver-turno.component';
import { PeriodoComponent } from './periodo/periodo.component';

@NgModule({
  declarations: [
    DocenteComponent,
    PlanCursosComponent,
    VerTurnoComponent,
    PeriodoComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    TiRoutingModule,

    // ng-zorro
    NzPopconfirmModule,
    NzTableModule,
    NzSelectModule,
    NgxPaginationModule,
    NgxApexchartsModule,
    NzAutocompleteModule,
    NzInputModule,
  ],
})
export class TiModule {}
