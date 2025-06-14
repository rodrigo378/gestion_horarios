import { PisoPipe } from './piso.pipe';
import { NgModule } from '@angular/core';
import en from '@angular/common/locales/en';
import { AppComponent } from './app.component';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { es_ES, provideNzI18n } from 'ng-zorro-antd/i18n';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './common/layout/layout.component';
import { NotFountComponent } from './pages/not-fount/not-fount.component';
import { VerTurnosComponent } from './pages/ver-turnos/ver-turnos.component';
import { VerCursosComponent } from './pages/ver-cursos/ver-cursos.component';
import { ReporteriaComponent } from './pages/reporteria/reporteria.component';
import { VerHorarioComponent } from './pages/ver-horario/ver-horario.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CalenderAulaComponent } from './pages/calender-aula/calender-aula.component';
import { AgruparCursosComponent } from './pages/agrupar-cursos/agrupar-cursos.component';
import { AsignarhorarioComponent } from './pages/asignar-horario/asignarhorario.component';
import { ReporteriaAulaComponent } from './pages/reporteria-aula/reporteria-aula.component';
import { VerTransversalComponent } from './pages/ver-transversal/ver-transversal.component';
import { CalenderDocenteComponent } from './pages/calender-docente/calender-docente.component';
import { VerAsistenciaComponent } from './pages/docente/ver-asistencia/ver-asistencia.component';
import { CalenderDirectorComponent } from './pages/calender-director/calender-director.component';
import { AsignarHorarioDrComponent } from './pages/asignar-horario-dr/asignar-horario-dr.component';
import { MarcarAsistenciaComponent } from './pages/docente/marcar-asistencia/marcar-asistencia.component';

import { TiModule } from './pages/ti/ti.module';
import { AdminModule } from './pages/admin/admin.module';
import { DashboardModule } from './pages/dashboard/dashboard.module';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    LoginComponent,
    NotFountComponent,
    VerHorarioComponent,
    AsignarhorarioComponent,
    VerTurnosComponent,
    VerCursosComponent,
    VerTransversalComponent,
    PisoPipe,
    ReporteriaComponent,
    AgruparCursosComponent,
    AsignarHorarioDrComponent,
    ReporteriaAulaComponent,
    CalenderAulaComponent,
    CalenderDocenteComponent,
    VerTransversalComponent,
    AgruparCursosComponent,
    CalenderDirectorComponent,
    MarcarAsistenciaComponent,
    VerAsistenciaComponent,
  ],
  imports: [
    //nuevo
    TiModule,
    AdminModule,
  ],
  providers: [
    provideNzI18n(es_ES),
    provideAnimationsAsync(),
    provideHttpClient(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
