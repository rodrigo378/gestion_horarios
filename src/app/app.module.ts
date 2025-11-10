import { NgModule } from '@angular/core';
import en from '@angular/common/locales/en';
import { AppComponent } from './app.component';
import { CommonModule, registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { es_ES, provideNzI18n } from 'ng-zorro-antd/i18n';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './common/layout/layout.component';
import { NotFountComponent } from './pages/not-fount/not-fount.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TiModule } from './pages/ti/ti.module';
import { DashboardModule } from './pages/dashboard/dashboard.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { RouterOutlet } from '@angular/router';
import { DecanoModule } from './pages/decano/decano.module';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthInterceptor } from './interceptors/auth.interceptor';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    LoginComponent,
    NotFountComponent,
  ],
  imports: [
    NzIconModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NzLayoutModule,
    NzMenuModule,
    NzButtonModule,
    NzTagModule,
    NzAlertModule,
    RouterOutlet,
    BrowserModule,
    AppRoutingModule,
    TiModule,
    DashboardModule,
    DecanoModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideNzI18n(es_ES),
    provideAnimationsAsync(),
    provideHttpClient(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
