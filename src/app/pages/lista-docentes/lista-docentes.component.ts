import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DocenteService } from '../../services/docente.service';
import { listadocentes } from '../../interfaces/Docentes';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-lista-docentes',
  standalone: false,
  templateUrl: './lista-docentes.component.html',
  styleUrl: './lista-docentes.component.css',
})
export class ListaDocentesComponent implements OnInit {
  itemsPorPagina = 5;
  paginaActual = 1;
  docentes: listadocentes[] = [];
  usuariosFiltrados: listadocentes[] = []; // Se inicializa correctamente
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
    // this.docenteService.getDocentes().subscribe({
    //   next: (data: any[]) => {
    //     this.docentes = data.map((docente) => ({
    //       ...docente,
    //       estado: Number(docente.estado),
    //     }));
    //     this.usuariosFiltrados = [...this.docentes];
    //   },
    //   error: (error) => {
    //     console.error('Error al obtener docentes:', error);
    //   },
    // });
  }

  aprobar(id?: number) {
    if (id === undefined) {
      console.error('El ID del docente es undefined');
      return;
    }

    this.docenteService.aprobarDocente(id).subscribe({
      next: (response: any) => {
        this.alertService.success(response.message ?? '');
        this.cargarDocentes();
        console.log(response);
      },
      error: (error: any) => {
        console.error('Error al aprobar docente', error);
        alert(error.error.message || 'No se pudo aprobar el docente');
      },
    });
  }

  rechazar(id?: number) {
    if (id === undefined) {
      console.error('El ID del docente es undefined');
      return;
    }

    this.docenteService.rechazarDocente(id).subscribe({
      next: (response: any) => {
        this.alertService.success(response.message ?? '');
        this.cargarDocentes();
        console.log(response);
      },
      error: (error: any) => {
        console.error('Error al rechazar docente', error);
        alert(error.error.message || 'No se pudo rechazar el docente');
      },
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
