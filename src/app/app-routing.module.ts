import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './common/layout/layout.component';
import { RegistroDocentesComponent } from './pages/registro-docentes/registro-docentes.component';
import { authGuard } from './guards/auth.guard';

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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
