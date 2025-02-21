import { Component } from '@angular/core';

@Component({
  selector: 'app-registro-docentes',
  standalone: false,
  templateUrl: './registro-docentes.component.html',
  styleUrl: './registro-docentes.component.css'
})
export class RegistroDocentesComponent {
  currentStep =  1;
  totalSteps = 10;
  domicilios: any [] = [{}];

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  agregarDomicilio(){
    this.domicilios.push({})
  }

  eliminarDomicilio(index: number): void{
    if (this.domicilios.length > 1){
      this.domicilios.splice(index , 1)
    }
  }
}
