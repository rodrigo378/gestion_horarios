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
  formacion_academica: any [] = [{}]
  titulo_profesional: any [] = [{}]
  formacion_complementaria: any [] = [{}]
  exp_docentes: any [] = [{}]
  exp_investigadora: any [] = [{}]
  libro: any [] = [{}]
  proyecto_investigacion: any [] = [{}]
  asesoria_jurado: any [] = [{}]
  otros: any [] = [{}]


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
  agregarForaca(){
    this.formacion_academica.push({})
  }

  eliminarFormaca(index: number): void{
    if (this.formacion_academica.length > 1){
      this.formacion_academica.splice(index , 1)
    }
  }
  agregarTitoprof(){
    this.titulo_profesional.push({})
  }

  eliminarTitoprof(index: number): void{
    if (this.titulo_profesional.length > 1){
      this.titulo_profesional.splice(index , 1)
    }
  }

  agregarFormcom(){
    this.formacion_complementaria.push({})
  }

  eliminarFomrcom(index: number): void{
    if (this.formacion_complementaria.length > 1){
      this.formacion_complementaria.splice(index , 1)
    }
  }

  agregarexp(){
    this.exp_docentes.push({})
  }

  eliminarexp(index: number): void{
    if (this.exp_docentes.length > 1){
      this.exp_docentes.splice(index , 1)
    }
  }

  agregarexpinvestigadora(){
    this.exp_investigadora.push({})
  }

  eliminarexpinvestigadora(index: number): void{
    if (this.exp_investigadora.length > 1){
      this.exp_investigadora.splice(index , 1)
    }
  }

  agregarlibro(){
    this.libro.push({})
  }

  eliminarlibro(index: number): void{
    if (this.libro.length > 1){
      this.libro.splice(index , 1)
    }
  }
  
  agregarproyec(){
    this.proyecto_investigacion.push({})
  }

  eliminarproyec(index: number): void{
    if (this.proyecto_investigacion.length > 1){
      this.proyecto_investigacion.splice(index , 1)
    }
  }

  agregarasejura(){
    this.asesoria_jurado.push({})
  }

  eliminarasejura(index: number): void{
    if (this.asesoria_jurado.length > 1){
      this.asesoria_jurado.splice(index , 1)
    }
  }

  agregarotros(){
    this.otros.push({})
  }

  eliminarotros(index: number): void{
    if (this.otros.length > 1){
      this.otros.splice(index , 1)
    }
  }
}
