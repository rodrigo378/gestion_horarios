import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Turno } from '../../interfaces/turno';
import { TurnoService } from '../../services/turno.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ver-turnos',
  standalone: false,
  templateUrl: './ver-turnos.component.html',
  styleUrl: './ver-turnos.component.css'
})
export class VerTurnosComponent implements OnInit{

  itemsPorPagina = 8;
  paginaActual = 1;
  modalAbierto = false;
  turnos: Turno[] =  []
  turnoSeleccionado: { [key: number]: string } = {};

  constructor(
    private location: Location,
    private turnoServices: TurnoService,
    private router: Router
  ){}
  
  ngOnInit(): void {
    this.turnoServices.getTurnos().subscribe((data)=>{
      this.turnos = data;
      this.turnosFiltrados = data;
    })
  }

  verCursos(turno: Turno){
    this.router.navigate(['/asignarhorario'],{
      queryParams:{
        id:turno.id
      }
    });
  }

  //#region CRUD turnos
  
  //#endregion

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
  
  get turnosPaginados(): Turno[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.turnosFiltrados.slice(inicio, fin);
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

  turnosFiltrados: Turno[] = [];
  filtroBusqueda: string = '';  

  filtrarturnos() {
    const texto = this.filtroBusqueda.toLowerCase();

    this.turnosFiltrados = this.turnos.filter(turno =>
      turno.nom_fac.toLowerCase().includes(texto) ||
      turno.nomesp.toLowerCase().includes(texto) ||
      turno.c_grpcur.toLowerCase().includes(texto) ||
      turno.n_ciclo.toString().includes(texto) ||
      turno.c_nommod.toLowerCase().includes(texto) ||
      (turno.estado === 1 ? 'asignado' : 'no asignado').toLowerCase().includes(texto)
    );
    this.paginaActual = 1
  }

}
