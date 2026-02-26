import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DocenteRoutingModule } from './docente-routing.module';

// COMPONENTE
import { AsistenciaComponent } from './asistencia/asistencia.component';

// NG-ZORRO (Ant Design)
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

@NgModule({
  declarations: [
    AsistenciaComponent, // ✅ declara el componente
  ],
  imports: [
    CommonModule,
    FormsModule, // ✅ necesario para [(ngModel)]
    DocenteRoutingModule,

    // ✅ ng-zorro
    NzSelectModule,
    NzButtonModule,
    NzTableModule,
    NzModalModule,
    NzInputModule,
    NzCardModule,
    NzDatePickerModule,
    NzCheckboxModule,
  ],
})
export class DocenteModule {}
