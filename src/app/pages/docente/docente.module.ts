import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocenteRoutingModule } from './docente-routing.module';
import { MarcarAsistenciaComponent } from './marcar-asistencia/marcar-asistencia.component';
import { VerAsistenciaComponent } from './ver-asistencia/ver-asistencia.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';

@NgModule({
  declarations: [MarcarAsistenciaComponent, VerAsistenciaComponent],
  imports: [
    CommonModule,
    DocenteRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NzAutocompleteModule,
  ],
})
export class DocenteModule {}
