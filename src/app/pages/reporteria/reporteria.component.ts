import { Component, OnInit } from '@angular/core';
import { DocenteService } from '../../services/docente.service';
import { AlertService } from '../../services/alert.service';
import { Location } from '@angular/common';
import { Docente, DocenteExtendido, HorarioAsignado } from '../../interfaces/Docente';

@Component({
  selector: 'app-reporteria',
  standalone: false,
  templateUrl: './reporteria.component.html',
  styleUrl: './reporteria.component.css'
})
export class ReporteriaComponent implements OnInit {
  itemsPorPagina = 10;
  paginaActual = 1;
  usuariosFiltrados: DocenteExtendido[] = []; // Se inicializa correctamente
  docentes: DocenteExtendido[] = [];
  filtroBusqueda: string = '';

  constructor(
    private location: Location,
    private docenteService: DocenteService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.cargarDocentes();
  }

  cargarDocentes() {
    this.docenteService.getDocentes().subscribe({
      next: (data: any[]) => {
        this.docentes = data.map((docente) => ({
          ...docente,
          expanded: false
        }));
        this.usuariosFiltrados = [...this.docentes];
      },
      error: (error) => {
        console.error('Error al obtener docentes:', error);
      },
    });
  }

  getHorariosPorCarrera(docente: Docente): { [key: string]: HorarioAsignado[] } {
    const agrupado: { [key: string]: HorarioAsignado[] } = {};
  
    if (!docente.Horario || docente.Horario.length === 0) return agrupado;
  
    const clave = docente.nom_fac || 'Sin Facultad';
    agrupado[clave] = docente.Horario;
  
    return agrupado;
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

  toggleExpand(docente: DocenteExtendido) {
    docente.expanded = !docente.expanded;
  }  

  filtrarUsuarios() {
    this.usuariosFiltrados = this.docentes.filter(
      (docente) =>
        docente.c_nomdoc
          .toLowerCase()
          .includes(this.filtroBusqueda.toLowerCase()) ||
        docente.categoria
          .toLowerCase()
          .includes(this.filtroBusqueda.toLowerCase()) ||
        docente.h_min
          .toString()
          .toLowerCase()
          .includes(this.filtroBusqueda.toLowerCase()) ||
        docente.h_max
        .toString()
          .toLowerCase()
          .includes(this.filtroBusqueda.toLowerCase()) ||
        docente.h_total
          .toString()
          .toLowerCase()
          .includes(this.filtroBusqueda.toLowerCase())
    );
  }
}
