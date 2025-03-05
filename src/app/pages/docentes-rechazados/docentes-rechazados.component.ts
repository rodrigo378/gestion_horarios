import { Component } from '@angular/core';
import { listadocentes } from '../../interfaces/Docentes';
import { DocenteService } from '../../services/docente.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-docentes-rechazados',
  standalone: false,
  templateUrl: './docentes-rechazados.component.html',
  styleUrl: './docentes-rechazados.component.css'
})
export class DocentesRechazadosComponent {
  itemsPorPagina = 5;
  paginaActual = 1;
  docentes: listadocentes[] = [];
  usuariosFiltrados: listadocentes[] = [];
  filtroBusqueda: string = '';

  constructor(
    private location: Location,
    private docenteService: DocenteService
  ) {}

  ngOnInit(): void {
    this.cargarDocentes();
  }

cargarDocentes() {
  this.docenteService.getDocentesRechazados().subscribe({
    next: (data: listadocentes[]) => {
      this.docentes = data.map(docente => ({
        ...docente,
        estado: Number(docente.estado)
      }));
      this.usuariosFiltrados = [...this.docentes];
    },
    error: (error) => {
      console.error('Error al obtener docentes:', error);
    }
  });
}


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
    this.usuariosFiltrados = this.docentes.filter(docente => 
      docente.nombres.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
      docente.apellido_paterno.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
      docente.apellido_materno.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
      docente.email.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
      docente.tipo_identificacion.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
      docente.numero_identificacion.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
      docente.celular.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
      String(docente.estado).toLowerCase().includes(this.filtroBusqueda.toLowerCase())
    );
  }
}