import { NgModule } from '@angular/core';
import { authGuard } from './guards/auth.guard';
// import { PeriodoComponent } from './pages/ti/periodo/periodo.component';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { NotFountComponent } from './pages/not-fount/not-fount.component';
import { LoginComponent } from './pages/login/login.component';
// import { ListarUsuariosComponent } from './pages/admin/listar-usuarios/listar-usuarios.component';
// import { PermisosUsuariosComponent } from './pages/admin/permisos-usuarios/permisos-usuarios.component';
// import { MarcarAsistenciaComponent } from './pages/docente/marcar-asistencia/marcar-asistencia.component';
// import { VerAsistenciaComponent } from './pages/docente/ver-asistencia/ver-asistencia.component';

// import { VerTurnosComponent } from './pages/decano/ver-turnos/ver-turnos.component';
// import { ReporteriaComponent } from './pages/decano/reporteria/reporteria.component';
// import { ReporteriaAulaComponent } from './pages/decano/reporteria-aula/reporteria-aula.component';
// import { VerCursosComponent } from './pages/decano/ver-cursos/ver-cursos.component';
// import { AgruparCursosComponent } from './pages/decano/agrupar-cursos/agrupar-cursos.component';
// import { VerTransversalComponent } from './pages/decano/ver-transversal/ver-transversal.component';
// import { CalenderAulaComponent } from './pages/decano/calender-aula/calender-aula.component';
// import { AsignarhorarioComponent } from './pages/decano/asignar-horario/asignarhorario.component';
// import { CalenderDirectorComponent } from './pages/director/calender-director/calender-director.component';
// import { CalenderDocenteComponent } from './pages/decano/calender-docente/calender-docente.component';
// import { AsignarHorarioDrComponent } from './pages/director/asignar-horario-dr/asignar-horario-dr.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'ti',
    // canActivate: [authGuard],
    loadChildren: () => import('./pages/ti/ti.module').then((m) => m.TiModule),
  },
  {
    path: 'dashboard',
    // canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/dashboard/dashboard.module').then(
        (m) => m.DashboardModule
      ),
  },
  {
    path: 'admin',
    // canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'coa',
    // canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/decano/decano.module').then((m) => m.DecanoModule),
  },
  {
    path: 'director',
    // canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/director/director.module').then((m) => m.DirectorModule),
  },
  {
    path: 'docente',
    // canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/docente/docente.module').then((m) => m.DocenteModule),
  },
  { path: '', component: NotFountComponent },
  { path: '**', component: NotFountComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
