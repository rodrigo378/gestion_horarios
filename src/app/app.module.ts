import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { es_ES, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { IconsProviderModule } from './icons-provider.module';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { LayoutComponent } from './common/layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { RegistroDocentesComponent } from './pages/registro-docentes/registro-docentes.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NotFountComponent } from './pages/not-fount/not-fount.component';
import { ListarUsuariosComponent } from './pages/admin/listar-usuarios/listar-usuarios.component';
import { ListaDocentesComponent } from './pages/lista-docentes/lista-docentes.component';
import { DocentesAprobadosComponent } from './pages/docentes-aprobados/docentes-aprobados.component';
import { DocentesRechazadosComponent } from './pages/docentes-rechazados/docentes-rechazados.component';
import { EscogerCursoDocenteComponent } from './pages/escoger-curso-docente/escoger-curso-docente.component';
import { PostularCursoComponent } from './pages/postular-curso/postular-curso.component';
import { VerHorarioComponent } from './pages/ver-horario/ver-horario.component';
import { VerInformacionComponent } from './pages/ver-informacion/ver-informacion.component';
import { AsignarhorarioComponent } from './pages/asignar-horario/asignarhorario.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VerTurnosComponent } from './pages/ver-turnos/ver-turnos.component';
import { VerCursosComponent } from './pages/ver-cursos/ver-cursos.component';
import { PisoPipe } from './piso.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { VerTransversalComponent } from './pages/ver-transversal/ver-transversal.component';
import { ReporteriaComponent } from './pages/reporteria/reporteria.component';
import { AgruparCursosComponent } from './pages/agrupar-cursos/agrupar-cursos.component';
import { AsignarHorarioDrComponent } from './pages/asignar-horario-dr/asignar-horario-dr.component';
import { VerTurnoDrComponent } from './pages/ver-turno-dr/ver-turno-dr.component';
import { PermisosUsuariosComponent } from './pages/admin/permisos-usuarios/permisos-usuarios.component';
import { ReporteriaAulaComponent } from './pages/reporteria-aula/reporteria-aula.component';
import { CalenderAulaComponent } from './pages/calender-aula/calender-aula.component';
import { CalenderDocenteComponent } from './pages/calender-docente/calender-docente.component';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    LoginComponent,
    RegistroDocentesComponent,
    NotFountComponent,
    ListarUsuariosComponent,
    ListaDocentesComponent,
    DocentesAprobadosComponent,
    DocentesRechazadosComponent,
    EscogerCursoDocenteComponent,
    PostularCursoComponent,
    VerHorarioComponent,
    VerInformacionComponent,
    AsignarhorarioComponent,
    VerTurnosComponent,
    VerCursosComponent,
    VerTransversalComponent,
    PisoPipe,
    ReporteriaComponent,
    AgruparCursosComponent,
    AsignarHorarioDrComponent,
    VerTurnoDrComponent,
    PermisosUsuariosComponent,
    ReporteriaAulaComponent,
    CalenderAulaComponent,
    CalenderDocenteComponent,
    VerTransversalComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
    ReactiveFormsModule,
    FullCalendarModule,
    BrowserAnimationsModule,
    FormsModule,
    NgxPaginationModule,
  ],
  providers: [
    provideNzI18n(es_ES),
    provideAnimationsAsync(),
    provideHttpClient(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
