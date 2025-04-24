import { PisoPipe } from './piso.pipe';
import { NgModule } from '@angular/core';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxApexchartsModule } from 'ngx-apexcharts';
import { registerLocaleData } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { AppRoutingModule } from './app-routing.module';
import { provideHttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { es_ES, provideNzI18n } from 'ng-zorro-antd/i18n';
import { FullCalendarModule } from '@fullcalendar/angular';
import { IconsProviderModule } from './icons-provider.module';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './common/layout/layout.component';
import { NotFountComponent } from './pages/not-fount/not-fount.component';
import { VerTurnosComponent } from './pages/ver-turnos/ver-turnos.component';
import { VerCursosComponent } from './pages/ver-cursos/ver-cursos.component';
import { ReporteriaComponent } from './pages/reporteria/reporteria.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VerHorarioComponent } from './pages/ver-horario/ver-horario.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CalenderAulaComponent } from './pages/calender-aula/calender-aula.component';
import { PostularCursoComponent } from './pages/postular-curso/postular-curso.component';
import { AgruparCursosComponent } from './pages/agrupar-cursos/agrupar-cursos.component';
import { ListaDocentesComponent } from './pages/lista-docentes/lista-docentes.component';
import { AsignarhorarioComponent } from './pages/asignar-horario/asignarhorario.component';
import { VerInformacionComponent } from './pages/ver-informacion/ver-informacion.component';
import { ReporteriaAulaComponent } from './pages/reporteria-aula/reporteria-aula.component';
import { VerTransversalComponent } from './pages/ver-transversal/ver-transversal.component';
import { CalenderDocenteComponent } from './pages/calender-docente/calender-docente.component';
import { CalenderDirectorComponent } from './pages/calender-director/calender-director.component';
import { RegistroDocentesComponent } from './pages/registro-docentes/registro-docentes.component';
import { ListarUsuariosComponent } from './pages/admin/listar-usuarios/listar-usuarios.component';
import { AsignarHorarioDrComponent } from './pages/asignar-horario-dr/asignar-horario-dr.component';
import { DocentesAprobadosComponent } from './pages/docentes-aprobados/docentes-aprobados.component';
import { PermisosUsuariosComponent } from './pages/admin/permisos-usuarios/permisos-usuarios.component';
import { DocentesRechazadosComponent } from './pages/docentes-rechazados/docentes-rechazados.component';
import { EscogerCursoDocenteComponent } from './pages/escoger-curso-docente/escoger-curso-docente.component';

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
    PermisosUsuariosComponent,
    ReporteriaAulaComponent,
    CalenderAulaComponent,
    CalenderDocenteComponent,
    VerTransversalComponent,
    AgruparCursosComponent,
    CalenderDirectorComponent,
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
    NgxApexchartsModule,
  ],
  providers: [
    provideNzI18n(es_ES),
    provideAnimationsAsync(),
    provideHttpClient(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
