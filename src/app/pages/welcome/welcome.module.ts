import { NgModule } from '@angular/core';

import { WelcomeRoutingModule } from './welcome-routing.module';

import { WelcomeComponent } from './welcome.component';

import { NgxApexchartsModule } from 'ngx-apexcharts';
import { CommonModule } from '@angular/common';


@NgModule({
  imports: [
    WelcomeRoutingModule,
    NgxApexchartsModule,
    CommonModule
  ],
  declarations: [WelcomeComponent],
  exports: [WelcomeComponent]
})
export class WelcomeModule { }
