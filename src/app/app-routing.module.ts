import { NgModule } from '@angular/core';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './common/layout/layout.component';
import { PeriodoComponent } from './pages/periodo/periodo.component';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { NotFountComponent } from './pages/not-fount/not-fount.component';
import { VerTurnosComponent } from './pages/ver-turnos/ver-turnos.component';
import { VerCursosComponent } from './pages/ver-cursos/ver-cursos.component';
import { ReporteriaComponent } from './pages/reporteria/reporteria.component';
import { CalenderAulaComponent } from './pages/calender-aula/calender-aula.component';
import { AgruparCursosComponent } from './pages/agrupar-cursos/agrupar-cursos.component';
import { AsignarhorarioComponent } from './pages/asignar-horario/asignarhorario.component';
import { ReporteriaAulaComponent } from './pages/reporteria-aula/reporteria-aula.component';
import { VerTransversalComponent } from './pages/ver-transversal/ver-transversal.component';
import { CalenderDocenteComponent } from './pages/calender-docente/calender-docente.component';
import { CalenderDirectorComponent } from './pages/calender-director/calender-director.component';
import { ListarUsuariosComponent } from './pages/admin/listar-usuarios/listar-usuarios.component';
import { AsignarHorarioDrComponent } from './pages/asignar-horario-dr/asignar-horario-dr.component';
import { PermisosUsuariosComponent } from './pages/admin/permisos-usuarios/permisos-usuarios.component';
import { MarcarAsistenciaComponent } from './pages/docente/marcar-asistencia/marcar-asistencia.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    canActivate: [authGuard],
    component: LayoutComponent,
    children: [
      { path: 'usuario', component: ListarUsuariosComponent },
      { path: 'permiso', component: PermisosUsuariosComponent },
    ],
  },
  {
    path: 'coa',
    canActivate: [authGuard],
    component: LayoutComponent,
    children: [
      { path: 'periodo', component: PeriodoComponent },
      { path: 'turno', component: VerTurnosComponent },
      { path: 'docente', component: ReporteriaComponent },
      { path: 'aula', component: ReporteriaAulaComponent },
      { path: 'cursos/:id', component: VerCursosComponent },
      { path: 'agrupar', component: AgruparCursosComponent },
      { path: 'transversal', component: VerTransversalComponent },
      { path: 'calendario_aula', component: CalenderAulaComponent },
      { path: 'asignarhorario', component: AsignarhorarioComponent },
      { path: 'calender_turno', component: CalenderDirectorComponent },
      { path: 'calendario_docente', component: CalenderDocenteComponent },
    ],
  },
  {
    path: 'director',
    canActivate: [authGuard],
    component: LayoutComponent,
    children: [
      { path: 'turno', component: VerTurnosComponent },
      { path: 'docente', component: ReporteriaComponent },
      { path: 'calender_turno', component: CalenderDirectorComponent },
      { path: 'asignarhorario', component: AsignarHorarioDrComponent },
      { path: 'calendario_docente', component: CalenderDocenteComponent },
    ],
  },
  {
    path: 'docente',
    canActivate: [authGuard],
    component: LayoutComponent,
    children: [{ path: 'marcar', component: MarcarAsistenciaComponent }],
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'welcome' },
      {
        path: 'welcome',
        loadChildren: () =>
          import('./pages/welcome/welcome.module').then((m) => m.WelcomeModule),
      },
    ],
  },
  { path: '**', component: NotFountComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
