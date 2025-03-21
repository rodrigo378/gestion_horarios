import { Location } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-ver-turnos',
  standalone: false,
  templateUrl: './ver-turnos.component.html',
  styleUrl: './ver-turnos.component.css'
})
export class VerTurnosComponent {

  itemsPorPagina = 5;
  paginaActual = 1;

  modalAbierto = false;

  turnos =[
    { facultad: 'Escuela de Ingienería', especialidad: 'ADMINISTRACIÓN Y MARKETING', modalidad: 'Precencial', seccion: 'N1', ciclo: '1', estado: 'asignado' },
    { facultad: 'Escuela de Salud', especialidad: 'ENFERMERÍA', modalidad: 'Semiprecencial', seccion: 'N1', ciclo: '2', estado: 'asignado' },
    { facultad: 'Escuela de Ingienería', especialidad: 'INGENIERÍA DE INTELIGENCIA ARTIFICIAL', modalidad: 'Virtual', seccion: 'M1', ciclo: '3', estado: 'no asignado' },
    { facultad: 'Escuela de Salud', especialidad: 'NUTRICIÓN Y DIETÉTICA', modalidad: 'Precencial', seccion: 'N2', ciclo: '1', estado: 'asignado' },
    { facultad: 'Escuela de Ingienería', especialidad: 'ADMINISTRACIÓN Y MARKETING', modalidad: 'Semiprecencial', seccion: 'N1', ciclo: '4', estado: 'asignado' },
    { facultad: 'Escuela de Salud', especialidad: 'TECNOLOGÍA MÉDICA EN TERAPIA FÍSICA Y REHABILITACIÓN', modalidad: 'Precencial', seccion: 'M1', ciclo: '5', estado: 'no asignado' },
    { facultad: 'Escuela de Salud', especialidad: 'TECNOLOGÍA MÉDICA EN LABORATORIO CLÍNICO Y ANATOMÍA PATOLÓGICA', modalidad: 'Semiprecencial', seccion: 'A', ciclo: '6', estado: 'asignado' },
    { facultad: 'Escuela de Ingienería', especialidad: 'CONTABILIDAD Y FINANZAS', modalidad: 'Virtual', seccion: 'N1', ciclo: '2', estado: 'asignado' },
    { facultad: 'Escuela de Salud', especialidad: 'ENFERMERÍA', modalidad: 'Virtual', seccion: 'M1', ciclo: '3', estado: 'no asignado' },
    { facultad: 'Escuela de Ingienería', especialidad: 'ADMINISTRACIÓN Y NEGOCIOS INTERNACIONALES', modalidad: 'Precencial', seccion: 'N2', ciclo: '1', estado: 'asignado' }
  ];
  
  constructor(
    private location: Location,
  ){}

  siguientePagina() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  anteriorPagina() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }
  
  get totalPaginas() {
    return Math.ceil(this.turnosFiltrados.length / this.itemsPorPagina);
  }
  
  get turnosPaginados() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.turnosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  abrirModal() {
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  cancel(){
    this.location.back();
  }

  turnosFiltrados = [...this.turnos];
  filtroBusqueda: string = ''; 

  filtrarturnos() {
    this.turnosFiltrados = this.turnos.filter(usuario => 
      usuario.facultad.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
      usuario.especialidad.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
      usuario.seccion.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
      usuario.ciclo.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
      usuario.modalidad.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
      usuario.estado.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) 
    );
  }
}
