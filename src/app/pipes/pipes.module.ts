import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PisoPipe } from './piso.pipe';

@NgModule({
  declarations: [PisoPipe],
  imports: [CommonModule],
  exports: [PisoPipe],
})
export class PipesModule {}
