import { NgModule } from '@angular/core';

import { WelcomeRoutingModule } from './welcome-routing.module';

import { WelcomeComponent } from './welcome.component';

import { NgxApexchartsModule } from 'ngx-apexcharts';


@NgModule({
  imports: [
    WelcomeRoutingModule,
    NgxApexchartsModule
  ],
  declarations: [WelcomeComponent],
  exports: [WelcomeComponent]
})
export class WelcomeModule { }
