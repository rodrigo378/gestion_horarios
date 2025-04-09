import { Component, OnInit } from '@angular/core';
import { AulaService } from '../../services/aula.service';
// import { AlertService } from '../../services/alert.service';
import { AulaExtendido, AulaReporte } from '../../interfaces/Aula';
import { Location } from '@angular/common';

@Component({
  selector: 'app-reporteria-aula',
  standalone: false,
  templateUrl: './reporteria-aula.component.html',
  styleUrl: './reporteria-aula.component.css'
})
export class ReporteriaAulaComponent implements OnInit{
  itemsPorPagina = 10;
  paginaActual = 1;
  usuariosFiltrados: AulaExtendido[] = []; // Se inicializa correctamente
  aula: AulaExtendido[] = [];
  filtroBusqueda: string = '';

  constructor(
    private location: Location,
    private aulaService: AulaService,
    // private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.cargarAula();
  }

  obtenerNombrePiso(piso: number): string {
    const nombres: { [key: string]: string } = {
      '-1': 'Sótano',
      '0': 'Sótano',
      '1': '1er piso',
      '2': '2do piso',
      '3': '3er piso',
      '4': '4to piso',
      '5': '5to piso',
      '6': '6to piso',
      '7': '7mo piso',
    };
    return nombres[piso.toString()] || `Piso ${piso}`;
  }  

  cargarAula() {
    this.aulaService.getAula().subscribe({
      next: (data: any[]) => {
        this.aula = data.map((aula) => ({
          ...aula,
          expanded: false
        }));
        this.usuariosFiltrados = [...this.aula];
      },
      error: (error) => {
        console.error('Error al obtener aulas:', error);
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

  toggleExpand(aula: AulaExtendido) {
    aula.expanded = !aula.expanded;
  }  

  filtrarUsuarios() {
    const filtro = this.filtroBusqueda.toLowerCase();
  
    const pisoTexto: Record<string, string> = {
      '-1': 'Sótano',
      '0': 'Sótano',
      '1': '1er piso',
      '2': '2do piso',
      '3': '3er piso',
      '4': '4to piso',
      '5': '5to piso',
      '6': '6to piso',
      '7': '7mo piso',
    };
  
    this.usuariosFiltrados = this.aula.filter((aula) => {
      const pisoEnTexto = pisoTexto[aula.n_piso.toString()]?.toLowerCase() || '';
  
      return (
        aula.c_codaula?.toLowerCase().includes(filtro) ||
        aula.n_piso.toString().includes(filtro) ||
        pisoEnTexto.includes(filtro) ||
        aula.pabellon?.toLowerCase().includes(filtro) ||
        aula.n_capacidad?.toString().includes(filtro) ||
        (aula.c_obs ? aula.c_obs.toLowerCase().includes(filtro) : false)
      );
    });
  }
  
}
