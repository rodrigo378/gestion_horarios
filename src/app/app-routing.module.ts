import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './common/layout/layout.component';
import { RegistroDocentesComponent } from './pages/registro-docentes/registro-docentes.component';
import { authGuard } from './guards/auth.guard';
import { NotFountComponent } from './pages/not-fount/not-fount.component';
import { ListarUsuariosComponent } from './pages/admin/listar-usuarios/listar-usuarios.component';
import { PermisosUsuariosComponent } from './pages/admin/permisos-usuarios/permisos-usuarios.component';
import { ListaDocentesComponent } from './pages/lista-docentes/lista-docentes.component';
import { DocentesAprobadosComponent } from './pages/docentes-aprobados/docentes-aprobados.component';
import { DocentesRechazadosComponent } from './pages/docentes-rechazados/docentes-rechazados.component';
import { EscogerCursoDocenteComponent } from './pages/escoger-curso-docente/escoger-curso-docente.component';
import { PostularCursoComponent } from './pages/postular-curso/postular-curso.component';
import { VerHorarioComponent } from './pages/ver-horario/ver-horario.component';
import { VerInformacionComponent } from './pages/ver-informacion/ver-informacion.component';
import { AsignarhorarioComponent } from './pages/asignar-horario/asignarhorario.component';
import { VerTurnosComponent } from './pages/ver-turnos/ver-turnos.component';
import { VerCursosComponent } from './pages/ver-cursos/ver-cursos.component';
import { VerTransversalComponent } from './pages/ver-transversal/ver-transversal.component';
import { ReporteriaComponent } from './pages/reporteria/reporteria.component';
import { AgruparCursosComponent } from './pages/agrupar-cursos/agrupar-cursos.component';
import { AsignarHorarioDrComponent } from './pages/asignar-horario-dr/asignar-horario-dr.component';
import { VerTurnoDrComponent } from './pages/ver-turno-dr/ver-turno-dr.component';
import { ReporteriaAulaComponent } from './pages/reporteria-aula/reporteria-aula.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
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
      { path: 'registrodocentes', component: RegistroDocentesComponent },
      { path: 'verinformacion', component: VerInformacionComponent },
      { path: 'cursoelegir', component: EscogerCursoDocenteComponent },
      { path: 'postularcurso', component: PostularCursoComponent },
      { path: 'verhorario', component: VerHorarioComponent },
      { path: 'listausuarios', component: ListarUsuariosComponent },
      { path: 'permisos', component: PermisosUsuariosComponent },
      { path: 'listadocentes', component: ListaDocentesComponent },
      { path: 'docenteaprobados', component: DocentesAprobadosComponent },
      { path: 'docentesrechazados', component: DocentesRechazadosComponent },
      { path: 'asignarhorario', component: AsignarhorarioComponent },
      { path: 'verturnos', component: VerTurnosComponent },
      { path: 'transversal', component: VerTransversalComponent },
      { path: 'cursos/:id', component: VerCursosComponent },
      { path: 'reporteria', component: ReporteriaComponent },
      { path: 'agrupar', component: AgruparCursosComponent },
      { path: 'verturnodr', component:VerTurnoDrComponent },
      { path: 'asignarhorariodr', component: AsignarHorarioDrComponent },
      { path: 'reporteriaaula', component: ReporteriaAulaComponent }
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
