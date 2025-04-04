import { Location } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-asignar-hora-docente',
  standalone: false,
  templateUrl: './asignar-hora-docente.component.html',
  styleUrl: './asignar-hora-docente.component.css'
})
export class AsignarHoraDocenteComponent {
  itemsPorPagina = 8;
  paginaActual = 1;
  docentes: any[] = [];
  usuariosFiltrados: any[] = []; // Se inicializa correctamente
  filtroBusqueda: string = '';

  constructor(
    private location: Location
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
    return Math.ceil(this.usuariosFiltrados.length / this.itemsPorPagina);
  }

  get usuariosPaginados() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.usuariosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  cancel() {
    this.location.back();
  }

  filtrarUsuarios() {
    this.usuariosFiltrados = this.docentes.filter(
      (docente) =>
        docente.nombres
          .toLowerCase()
          .includes(this.filtroBusqueda.toLowerCase()) ||
        docente.apellido_paterno
          .toLowerCase()
          .includes(this.filtroBusqueda.toLowerCase()) ||
        docente.apellido_materno
          .toLowerCase()
          .includes(this.filtroBusqueda.toLowerCase()) ||
        docente.email
          .toLowerCase()
          .includes(this.filtroBusqueda.toLowerCase()) ||
        docente.tipo_identificacion
          .toLowerCase()
          .includes(this.filtroBusqueda.toLowerCase()) ||
        docente.numero_identificacion
          .toLowerCase()
          .includes(this.filtroBusqueda.toLowerCase()) ||
        docente.celular
          .toLowerCase()
          .includes(this.filtroBusqueda.toLowerCase()) ||
        String(docente.estado)
          .toLowerCase()
          .includes(this.filtroBusqueda.toLowerCase()) // Convertir estado a string antes de toLowerCase()
    );
  }
}
