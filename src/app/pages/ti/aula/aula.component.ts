import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
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

  cargando = true;
  cargandoHorarios = false;
  cargandoAulas = false;
  actualizandoAula = false;

  constructor(
    private aulaService: AulaService,
    private siguService: SiguService,
  ) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    this.cargando = true;
    this.cargandoHorarios = true;
    this.cargandoAulas = true;

    this.getHorarios();
    this.getAulas();
  }

  validarCargaCompleta() {
    if (!this.cargandoHorarios && !this.cargandoAulas) {
      this.cargando = false;
    }
  }

  getHorarios() {
    this.cargandoHorarios = true;

    this.aulaService
      .gethorariosSigu()
      .pipe(
        finalize(() => {
          this.cargandoHorarios = false;
          this.validarCargaCompleta();
        }),
      )
      .subscribe({
        next: (data: any) => {
          this.horarios = data.map((item: any) => ({
            ...item,
            aulaSeleccionada: item.id_aula || '',
          }));

          this.aplicarFiltros();
        },
        error: (err: any) => {
          console.error('Error al obtener horarios', err);
        },
      });
  }

  getAulas() {
    this.cargandoAulas = true;

    this.siguService
      .getAulas()
      .pipe(
        finalize(() => {
          this.cargandoAulas = false;
          this.validarCargaCompleta();
        }),
      )
      .subscribe({
        next: (data: any) => {
          this.aulas = data;
        },
        error: (err: any) => {
          console.error('Error al obtener aulas', err);
        },
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

    this.actualizandoAula = true;

    let completados = 0;
    let huboError = false;

    idsHorario.forEach((idHorario: number) => {
      const payload = {
        id_horario: idHorario,
        id_aula: idAula,
      };

      console.log('payload =>', payload);

      this.siguService
        .updateAula(payload)
        .pipe(
          finalize(() => {
            completados++;

            if (completados === idsHorario.length) {
              this.actualizandoAula = false;

              if (!huboError) {
                item.id_aula = idAula;
              }
            }
          }),
        )
        .subscribe({
          next: (resp: any) => {
            console.log(
              `Actualizado correctamente id_horario ${idHorario}`,
              resp,
            );
          },
          error: (err: any) => {
            huboError = true;
            console.error(`Error al actualizar id_horario ${idHorario}`, err);
          },
        });
    });
  }

  trackByHorario(index: number, item: any): any {
    return item.id_horarios || item.courseid_temp || index;
  }

  trackByAula(index: number, aula: any): any {
    return aula.id_aula || index;
  }
}
