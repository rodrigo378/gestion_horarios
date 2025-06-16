import { NgModule } from '@angular/core';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './common/layout/layout.component';
import { PeriodoComponent } from './pages/ti/periodo/periodo.component';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { NotFountComponent } from './pages/not-fount/not-fount.component';
import { ListarUsuariosComponent } from './pages/admin/listar-usuarios/listar-usuarios.component';
import { PermisosUsuariosComponent } from './pages/admin/permisos-usuarios/permisos-usuarios.component';
import { MarcarAsistenciaComponent } from './pages/docente/marcar-asistencia/marcar-asistencia.component';
import { VerAsistenciaComponent } from './pages/docente/ver-asistencia/ver-asistencia.component';

import { VerTurnosComponent } from './pages/decano/ver-turnos/ver-turnos.component';
import { ReporteriaComponent } from './pages/decano/reporteria/reporteria.component';
import { ReporteriaAulaComponent } from './pages/decano/reporteria-aula/reporteria-aula.component';
import { VerCursosComponent } from './pages/decano/ver-cursos/ver-cursos.component';
import { AgruparCursosComponent } from './pages/decano/agrupar-cursos/agrupar-cursos.component';
import { VerTransversalComponent } from './pages/decano/ver-transversal/ver-transversal.component';
import { CalenderAulaComponent } from './pages/decano/calender-aula/calender-aula.component';
import { AsignarhorarioComponent } from './pages/decano/asignar-horario/asignarhorario.component';
import { CalenderDirectorComponent } from './pages/director/calender-director/calender-director.component';
import { CalenderDocenteComponent } from './pages/decano/calender-docente/calender-docente.component';
import { AsignarHorarioDrComponent } from './pages/director/asignar-horario-dr/asignar-horario-dr.component';

const routes: Routes = [
  // {
  //   path: '',
  //   component: LayoutComponent,
  //   canActivate: [authGuard],
  //   children: [
  //     { path: '', pathMatch: 'full', redirectTo: 'welcome' },
  //     {
  //       path: 'welcome',
  //       // component: WelcomeComponent,
  //     },
  //   ],
  // },
  // { path: 'login', component: LoginComponent },
  // {
  //   path: 'admin',
  //   canActivate: [authGuard],
  //   component: LayoutComponent,
  //   children: [
  //     { path: 'usuario', component: ListarUsuariosComponent },
  //     { path: 'permiso', component: PermisosUsuariosComponent },
  //   ],
  // },
  // {
  //   path: 'coa',
  //   canActivate: [authGuard],
  //   component: LayoutComponent,
  //   children: [
  //     { path: 'periodo', component: PeriodoComponent },
  //     { path: 'turno', component: VerTurnosComponent },
  //     { path: 'docente', component: ReporteriaComponent },
  //     { path: 'aula', component: ReporteriaAulaComponent },
  //     { path: 'cursos/:id', component: VerCursosComponent },
  //     { path: 'agrupar', component: AgruparCursosComponent },
  //     { path: 'transversal', component: VerTransversalComponent },
  //     { path: 'calendario_aula', component: CalenderAulaComponent },
  //     { path: 'asignarhorario', component: AsignarhorarioComponent },
  //     { path: 'calender_turno', component: CalenderDirectorComponent },
  //     { path: 'calendario_docente', component: CalenderDocenteComponent },
  //   ],
  // },
  // {
  //   path: 'director',
  //   canActivate: [authGuard],
  //   component: LayoutComponent,
  //   children: [
  //     { path: 'turno', component: VerTurnosComponent },
  //     { path: 'docente', component: ReporteriaComponent },
  //     { path: 'calender_turno', component: CalenderDirectorComponent },
  //     { path: 'asignarhorario', component: AsignarHorarioDrComponent },
  //     { path: 'calendario_docente', component: CalenderDocenteComponent },
  //   ],
  // },
  // {
  //   path: 'docente',
  //   canActivate: [authGuard],
  //   component: LayoutComponent,
  //   children: [
  //     { path: 'marcar', component: MarcarAsistenciaComponent },
  //     { path: 'ver-asistencia', component: VerAsistenciaComponent },
  //   ],
  // },
  // {
  //   path: 'ti',
  //   canActivate: [authGuard],
  //   loadChildren: () => import('./pages/ti/ti.module').then((m) => m.TiModule),
  // },
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
