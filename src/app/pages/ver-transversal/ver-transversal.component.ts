import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Curso2, Especialidad } from '../../interfaces/Curso';
import { HorarioService } from '../../services/horario.service';
import { CursoService } from '../../services/curso.service';
import { AlertService } from '../../services/alert.service';
import { TurnoService } from '../../services/turno.service';
import { Periodo } from '../../interfaces/turno';

@Component({
  selector: 'app-ver-transversal',
  standalone: false,
  templateUrl: './ver-transversal.component.html',
  styleUrl: './ver-transversal.component.css',
})
export class VerTransversalComponent implements OnInit {
  cursos: Curso2[] = [];
  curso!: Curso2;

  Math = Math;

  totalCursos!: number;

  periodos!: Periodo[];

  paginaActual: number = 1;
  todosSeleccionados: boolean = false;

  especialidades: Especialidad[] = [];
  especialidadesModal: Especialidad[] = [];
  cursosFiltrados: any[] = [];

  selectFacultadad: string = '';
  selectEspecialidad: string = '';
  selectModalidad: string = '';
  selectPlan: string = '2025';
  selectPeriodo: number = 20252;
  selectCiclo: string = '';

  arrayCheckboxCursos: number[] = [];

  mostrarModalCrear: boolean = false;

  itemsPorPagina: number = 20;

  filtros = {
    c_codmod: '',
    n_codper: '2025',
    periodo: 0,
    c_codfac: '',
    c_codesp: '',
  };

  filtroBusqueda: string = '';

  constructor(
    private horarioService: HorarioService,
    private cursoService: CursoService,
    private alertService: AlertService,
    private turnoService: TurnoService
  ) {}

  ngOnInit(): void {
    this.getPeriodos();
  }

  getCursos() {
    const skip = (this.paginaActual - 1) * this.itemsPorPagina;
    const take = this.itemsPorPagina;

    this.horarioService
      .getCurso(
        Number(this.selectModalidad),
        this.selectPlan,
        this.selectPeriodo,
        this.selectFacultadad,
        this.selectEspecialidad,
        undefined,
        Number(this.selectCiclo),
        undefined,
        this.filtroBusqueda.trim(),
        skip,
        take
      )
      .subscribe((data) => {
        this.cursos = data.data;
        console.log('cursos => ', this.cursos);

        this.totalCursos = data.total;
      });
  }

  getPeriodos() {
    this.turnoService.getPeriodos().subscribe((data) => {
      this.periodos = data;
    });
  }

  buscarDesdeInput() {
    this.paginaActual = 1;
    this.getCursos();
  }

  avanzarPagina() {
    const totalPaginas = Math.ceil(this.totalCursos / 20);
    if (this.paginaActual < totalPaginas) {
      this.paginaActual++;
      this.getCursos();
    }
  }

  retrocederPagina() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.getCursos();
    }
  }

  getCursoTransversal() {
    this.horarioService
      .getCurso(
        Number(this.filtros.c_codmod),
        this.filtros.n_codper,
        this.filtros.periodo,
        this.filtros.c_codfac,
        this.filtros.c_codesp
      )

      .subscribe((data) => {
        this.cursosFiltrados = data.data.filter((curso) => {
          const codA = this.curso.c_codcur;
          const codAeq = this.curso.c_codcur_equ;
          const codB = curso.c_codcur;
          const codBeq = curso.c_codcur_equ;
          const turno_idA = this.curso.turno_id;
          const turno_idB = curso.turno_id;
          const esMismoCurso = this.curso.id === curso.id;
          const esMismoTurno = turno_idA === turno_idB;

          return (
            !esMismoCurso &&
            !esMismoTurno &&
            (codA === codB ||
              codA === codBeq ||
              (codAeq && (codAeq === codB || codAeq === codBeq)))
          );
        });

        if (this.cursosFiltrados.length === 0) {
          this.alertService.info('Sin equivalencias');
        }
      });
  }

  changeSelectFacultad() {
    this.cursoService.getEspecialidades().subscribe((data) => {
      this.especialidades = data.filter(
        (especialidad) => especialidad.codfac === this.selectFacultadad
      );

      this.selectEspecialidad = '';
    });
  }

  changeSelectFacultadModal() {
    this.cursoService.getEspecialidades().subscribe((data) => {
      this.especialidadesModal = data.filter(
        (especialidad) => especialidad.codfac === this.filtros.c_codfac
      );

      this.filtros.c_codesp = '';
    });
  }

  clickMas(curso: Curso2) {
    this.curso = curso;
    this.filtros.periodo = curso.turno.n_codper;
    this.mostrarModalCrear = true;
  }

  clickBuscarCursosModal() {
    this.getCursoTransversal();
  }

  clickMasCursoTransversal(hijo_id: number) {
    this.horarioService
      .asociarHorarioTransversal(Number(this.curso.id), hijo_id)
      .subscribe({
        next: (res: any) => {
          this.getCursoTransversal();
          this.getCursos();
          this.alertService.success('Se crea el curso transversal');
        },
        error: (err: HttpErrorResponse) => {
          this.alertService.error(err.error.message);
          console.log(err);
        },
      });
  }

  cerrarModal() {
    this.todosSeleccionados = false;
    this.mostrarModalCrear = false;
    this.cursosFiltrados = [];
    this.arrayCheckboxCursos = [];
    this.filtros = {
      c_codmod: '',
      n_codper: '2025',
      periodo: 20252,
      c_codfac: '',
      c_codesp: '',
    };
  }

  estaSeleccionado(id: number): boolean {
    return this.arrayCheckboxCursos.includes(id);
  }

  toggleSeleccionCurso(curso: any) {
    const index = this.arrayCheckboxCursos.indexOf(curso.id);

    if (index !== -1) {
      this.arrayCheckboxCursos.splice(index, 1);
    } else {
      this.arrayCheckboxCursos.push(curso.id);
    }
  }

  toggleSeleccionarTodos() {
    this.todosSeleccionados = !this.todosSeleccionados;

    if (this.todosSeleccionados) {
      this.arrayCheckboxCursos = this.cursosFiltrados.map((c: any) => c.id);
    } else {
      this.arrayCheckboxCursos = [];
    }
  }

  clickGuardarModal() {
    this.horarioService
      .createTransversal(this.curso.id, this.arrayCheckboxCursos, 0)
      .subscribe({
        next: (res: any) => {
          this.getCursos();
          this.cursosFiltrados = [];
          this.arrayCheckboxCursos = [];
          this.filtros = {
            c_codmod: '',
            n_codper: '2025',
            periodo: 20252,
            c_codfac: '',
            c_codesp: '',
          };
          this.mostrarModalCrear = false;
          this.alertService.success('Se creo grupo correctamente');
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
          this.alertService.error(`${err.error.errores}`);
        },
      });
  }

  clickDeleteTransversal(padre_id: number) {
    this.horarioService.deleteTransversal(padre_id).subscribe({
      next: (res: any) => {
        this.getCursos();
        this.alertService.success('Se borro este grupo correctamente');
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
        this.alertService.error(`${err.error.errores}`);
      },
    });
  }

  cambiarItemsPorPagina(valor: number) {
    this.itemsPorPagina = valor;
    this.paginaActual = 1;
    this.getCursos();
  }

  mostrarAlertaVencido() {
    this.alertService.error(
      'La fecha de asignación ha caducado. Ya no puedes modificar este turno.'
    );
  }
}
