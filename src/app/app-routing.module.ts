import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { NotFountComponent } from './pages/not-fount/not-fount.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'ti',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/ti/ti.module').then((m) => m.TiModule),
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/dashboard/dashboard.module').then(
        (m) => m.DashboardModule
      ),
  },

  {
    path: 'coa',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/decano/decano.module').then((m) => m.DecanoModule),
  },
  {
    path: 'director',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/director/director.module').then((m) => m.DirectorModule),
  },
  { path: '', component: NotFountComponent, canActivate: [AuthGuard] },
  { path: '**', component: NotFountComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
