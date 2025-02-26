import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './common/layout/layout.component';
import { RegistroDocentesComponent } from './pages/registro-docentes/registro-docentes.component';
import { authGuard } from './guards/auth.guard';
import { NotFountComponent } from './pages/not-fount/not-fount.component';
import { ListarUsuariosComponent } from './pages/admin/listar-usuarios/listar-usuarios.component';
import { PermisosUsuariosComponent } from './pages/admin/permisos-usuarios/permisos-usuarios.component';
import { DisponibilidadHorariaComponent } from './pages/disponibilidad-horaria/disponibilidad-horaria.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'registrodocentes' },
      {
        path: 'welcome',
        loadChildren: () =>
          import('./pages/welcome/welcome.module').then((m) => m.WelcomeModule),
      },
      { path: 'registrodocentes', component: RegistroDocentesComponent },
      { path: 'listausuarios', component: ListarUsuariosComponent },
      { path: 'permisos', component: PermisosUsuariosComponent },
      { path: 'disponibilidad', component: DisponibilidadHorariaComponent }
    ], 
  },
  { path: '**', component:NotFountComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
