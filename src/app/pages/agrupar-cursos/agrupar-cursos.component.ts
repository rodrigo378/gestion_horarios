import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Curso2, Especialidad } from '../../interfaces/Curso';
import { HorarioService } from '../../services/horario.service';
import { CursoService } from '../../services/curso.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-agrupar-cursos',
  standalone: false,
  templateUrl: './agrupar-cursos.component.html',
  styleUrl: './agrupar-cursos.component.css',
})
export class AgruparCursosComponent {
  cursos: Curso2[] = [];
  curso!: Curso2;

  Math = Math; // 👈 Esto permite usar Math.ceil() en el HTML

  totalCursos!: number;

  paginaActual: number = 1;
  todosSeleccionados: boolean = false;

  especialidades: Especialidad[] = [];
  especialidadesModal: Especialidad[] = [];
  cursosFiltrados: Curso2[] = [];

  selectFacultadad: string = '';
  selectEspecialidad: string = '';
  selectModalidad: string = '';
  selectPlan: string = '';
  selectPeriodo: string = '';

  arrayCheckboxCursos: number[] = [];

  mostrarModalCrear: boolean = false;

  itemsPorPagina: number = 20;

  filtros = {
    c_codmod: '',
    n_codper: '2025',
    c_codfac: '',
    c_codesp: '',
  };

  constructor(
    private horarioService: HorarioService,
    private cursoService: CursoService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {}

  getCursos() {
    const itemsPorPagina = 20;
    const skip = (this.paginaActual - 1) * this.itemsPorPagina;
    const take = this.itemsPorPagina;   

    console.log('itemsPorPagina => ', itemsPorPagina);
    console.log('skip => ', skip);
    console.log('take => ', take);

    this.horarioService
      .getCurso(
        Number(this.selectModalidad),
        this.selectPeriodo,
        this.selectFacultadad,
        this.selectEspecialidad,
        undefined,
        undefined,
        skip,
        take
      )
      .subscribe((data) => {
        console.log('data => ', data);
        this.cursos = data.data;
        this.totalCursos = data.total;
      });
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
        this.filtros.c_codfac,
        this.filtros.c_codesp
      )
      .subscribe((data) => {
        this.cursosFiltrados = data.data.filter((curso) => {
          return curso.turno_id !== this.curso.turno_id;

          // const codA = this.curso.c_codcur;
          // const codAeq = this.curso.c_codcur_equ;
          // const codB = curso.c_codcur;
          // const codBeq = curso.c_codcur_equ;

          // const turno_idA = this.curso.turno_id;
          // const turno_idB = curso.turno_id;

          // const esMismoCurso = this.curso.id === curso.id;
          // const esMismoTurno = turno_idA === turno_idB;

          // return (
          //   !esMismoCurso &&
          //   !esMismoTurno &&
          //   (codA === codB ||
          //     codA === codBeq ||
          //     (codAeq && (codAeq === codB || codAeq === codBeq)))
          // );
        });

        console.log('📚 Cursos filtrados modal => ', this.cursosFiltrados);
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

  clickDefinirCursoTransversales() {
    this.getCursos();
  }

  clickMas(curso: Curso2) {
    console.log('curso => ', curso);
    this.curso = curso;
    this.mostrarModalCrear = true;
  }

  clickBuscarCursosModal() {
    this.getCursoTransversal();
  }

  clickMasCursoTransversal(hijo_id: number) {
    console.log('padre_id => ', this.curso.id);
    console.log('hijo_id => ', hijo_id);

    this.horarioService
      .asociarHorarioTransversal(Number(this.curso.id), hijo_id)
      .subscribe({
        next: (res: any) => {
          console.log(res);
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
      n_codper: '',
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

    console.log('Cursos seleccionados:', this.arrayCheckboxCursos);
  }

  toggleSeleccionarTodos() {
    this.todosSeleccionados = !this.todosSeleccionados;

    if (this.todosSeleccionados) {
      this.arrayCheckboxCursos = this.cursosFiltrados.map((c) => c.id);
    } else {
      this.arrayCheckboxCursos = [];
    }
  }

  clickGuardarModal() {
    console.log('padre_id => ', this.curso.id);
    console.log('hijos_id => ', this.arrayCheckboxCursos);

    this.horarioService
      .createGrupo(this.curso.id, this.arrayCheckboxCursos, 0)
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.getCursos();
          this.cursosFiltrados = [];
          this.arrayCheckboxCursos = [];
          this.filtros = {
            c_codmod: '',
            n_codper: '',
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
        console.log('se elimino => ', res);
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
}
