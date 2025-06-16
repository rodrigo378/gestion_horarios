import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { WelcomeComponent } from './welcome/welcome.component';
import { FormsModule } from '@angular/forms';
import { NgxApexchartsModule } from 'ngx-apexcharts';

@NgModule({
  declarations: [WelcomeComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    FormsModule,
    NgxApexchartsModule,
  ],
})
export class DashboardModule {}
