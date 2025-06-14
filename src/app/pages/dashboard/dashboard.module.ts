import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { WelcomeComponent } from './welcome/welcome.component';

@NgModule({
  declarations: [WelcomeComponent],
  imports: [CommonModule, DashboardRoutingModule],
})
export class DashboardModule {}
