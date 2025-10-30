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
import { PeriodoComponent } from './periodo/periodo.component';
import { VerTurnoComponent } from './ver-turno/ver-turno.component';
import { GenerarCursosComponent } from './generar-cursos/generar-cursos.component';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormPatchModule } from 'ng-zorro-antd/core/form';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

@NgModule({
  declarations: [
    DocenteComponent,
    PlanCursosComponent,
    PeriodoComponent,
    VerTurnoComponent,
    GenerarCursosComponent,
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
    NzDividerModule,
    NzModalModule,
    NzTagModule,
    NzBadgeModule,
    NzSpaceModule,

    NzToolTipModule,
    NzPaginationModule,
  ],
})
export class TiModule {}
