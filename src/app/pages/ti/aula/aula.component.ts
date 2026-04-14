import { Component, OnInit } from '@angular/core';
import { AulaService } from '../../../services/aula.service';
import { SiguService } from '../../../services/sigu.service';

@Component({
  selector: 'app-aula',
  standalone: false,
  templateUrl: './aula.component.html',
  styleUrl: './aula.component.css',
})
export class AulaComponent implements OnInit {
  horarios: any[] = [];
  horariosFiltrados: any[] = [];
  aulas: any[] = [];

  filtroCurso = '';
  filtroSeccion = '';
  filtroHorario = '';

  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 1;

  constructor(
    private aulaService: AulaService,
    private siguService: SiguService,
  ) {}

  ngOnInit(): void {
    this.getHorarios();
    this.getAulas();
  }

  getHorarios() {
    this.aulaService.gethorariosSigu().subscribe((data: any) => {
      this.horarios = data.map((item: any) => ({
        ...item,
        aulaSeleccionada: item.id_aula || '',
      }));

      this.aplicarFiltros();
    });
  }

  getAulas() {
    this.siguService.getAulas().subscribe((data: any) => {
      this.aulas = data;
    });
  }

  aplicarFiltros() {
    const curso = this.filtroCurso.toLowerCase().trim();
    const seccion = this.filtroSeccion.toLowerCase().trim();
    const horario = this.filtroHorario.toLowerCase().trim();

    this.horariosFiltrados = this.horarios.filter((item: any) => {
      const nombreCurso = (item.c_nomcur || '').toLowerCase();
      const nombreSeccion = (item.secciones || '').toLowerCase();
      const nombreHorario = (item.horario || '').toLowerCase();

      return (
        (!curso || nombreCurso.includes(curso)) &&
        (!seccion || nombreSeccion.includes(seccion)) &&
        (!horario || nombreHorario.includes(horario))
      );
    });

    this.paginaActual = 1;
    this.calcularTotalPaginas();
  }

  filtrarHorarios() {
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.filtroCurso = '';
    this.filtroSeccion = '';
    this.filtroHorario = '';
    this.aplicarFiltros();
  }

  calcularTotalPaginas() {
    this.totalPaginas = Math.ceil(
      this.horariosFiltrados.length / this.itemsPorPagina,
    );
    if (this.totalPaginas === 0) {
      this.totalPaginas = 1;
    }
  }

  get horariosPaginados() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.horariosFiltrados.slice(inicio, fin);
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  irAPagina(numero: number) {
    if (numero >= 1 && numero <= this.totalPaginas) {
      this.paginaActual = numero;
    }
  }

  get paginas(): number[] {
    const paginas: number[] = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  actualizarAula(item: any) {
    const idAula = item.aulaSeleccionada ? Number(item.aulaSeleccionada) : 0;

    const idsHorario = item.id_horarios
      ? String(item.id_horarios)
          .split(',')
          .map((id: string) => Number(id.trim()))
          .filter((id: number) => !!id)
      : [];

    console.log('id_horarios =>', idsHorario);
    console.log('id_aula =>', idAula);

    if (!idAula) {
      console.warn('Debe seleccionar un aula');
      return;
    }

    if (!idsHorario.length) {
      console.warn('No hay id_horarios para actualizar');
      return;
    }

    idsHorario.forEach((idHorario: number) => {
      const payload = {
        id_horario: idHorario,
        id_aula: idAula,
      };

      console.log('payload =>', payload);

      this.siguService.updateAula(payload).subscribe({
        next: (resp: any) => {
          console.log(
            `Actualizado correctamente id_horario ${idHorario}`,
            resp,
          );
        },
        error: (err: any) => {
          console.error(`Error al actualizar id_horario ${idHorario}`, err);
        },
      });
    });

    item.id_aula = idAula;
  }

  trackByHorario(index: number, item: any): any {
    return item.id_horarios || item.courseid_temp || index;
  }

  trackByAula(index: number, aula: any): any {
    return aula.id_aula || index;
  }

  get paginasVisibles(): (number | string)[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const paginas: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        paginas.push(i);
      }
      return paginas;
    }

    paginas.push(1);

    if (actual > 4) {
      paginas.push('...');
    }

    const inicio = Math.max(2, actual - 1);
    const fin = Math.min(total - 1, actual + 1);

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    if (actual < total - 3) {
      paginas.push('...');
    }

    paginas.push(total);

    return paginas;
  }
}
