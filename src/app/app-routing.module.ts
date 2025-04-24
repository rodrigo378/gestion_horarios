import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './common/layout/layout.component';
import { authGuard } from './guards/auth.guard';
import { NotFountComponent } from './pages/not-fount/not-fount.component';
import { ListarUsuariosComponent } from './pages/admin/listar-usuarios/listar-usuarios.component';
import { PermisosUsuariosComponent } from './pages/admin/permisos-usuarios/permisos-usuarios.component';
import { AsignarhorarioComponent } from './pages/asignar-horario/asignarhorario.component';
import { VerTurnosComponent } from './pages/ver-turnos/ver-turnos.component';
import { VerCursosComponent } from './pages/ver-cursos/ver-cursos.component';
import { VerTransversalComponent } from './pages/ver-transversal/ver-transversal.component';
import { ReporteriaComponent } from './pages/reporteria/reporteria.component';
import { AgruparCursosComponent } from './pages/agrupar-cursos/agrupar-cursos.component';
import { AsignarHorarioDrComponent } from './pages/asignar-horario-dr/asignar-horario-dr.component';
import { VerTurnoDrComponent } from './pages/ver-turno-dr/ver-turno-dr.component';
import { ReporteriaAulaComponent } from './pages/reporteria-aula/reporteria-aula.component';
import { CalenderDocenteComponent } from './pages/calender-docente/calender-docente.component';
import { CalenderAulaComponent } from './pages/calender-aula/calender-aula.component';

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
      { path: 'turno', component: VerTurnosComponent },
      { path: 'docente', component: ReporteriaComponent },
      { path: 'aula', component: ReporteriaAulaComponent },
      { path: 'transversal', component: VerTransversalComponent },
      { path: 'agrupar', component: AgruparCursosComponent },
      { path: 'asignarhorario', component: AsignarhorarioComponent },
      { path: 'cursos/:id', component: VerCursosComponent },
      { path: 'calendario_docente', component: CalenderDocenteComponent },
      { path: 'calendario_aula', component: CalenderAulaComponent },
    ],
  },
  {
    path: 'director',
    canActivate: [authGuard],
    component: LayoutComponent,
    children: [
      { path: 'turno', component: VerTurnoDrComponent },
      { path: 'asignarhorariodr', component: AsignarHorarioDrComponent },
      { path: 'docente', component: ReporteriaComponent },
      { path: 'calendario_docente', component: CalenderDocenteComponent },
    ],
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
