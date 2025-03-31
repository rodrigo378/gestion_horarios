import { Component, OnInit } from '@angular/core';
import { HorarioService } from '../../services/horario.service';
import { Curso2, Especialidad } from '../../interfaces/Curso';
import { CursoService } from '../../services/curso.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-ver-cursos',
  standalone: false,
  templateUrl: './ver-cursos.component.html',
  styleUrl: './ver-cursos.component.css',
})
export class VerCursosComponent implements OnInit {
  cursos: Curso2[] = [];
  curso!: Curso2;

  especialidades: Especialidad[] = [];
  especialidadesModal: Especialidad[] = [];
  cursosFiltrados: any[] = [];

  selectFacultadad: string = '';
  selectEspecialidad: string = '';
  selectModalidad: string = '';
  selectPlan: string = '';
  selectPeriodo: string = '';

  arrayCheckboxCursos: number[] = [];

  mostrarModalCrear: boolean = false;

  filtros = {
    c_codmod: '',
    n_codper: '',
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
    this.horarioService
      .getCurso(
        Number(this.selectModalidad),
        this.selectPeriodo,
        this.selectFacultadad,
        this.selectEspecialidad
      )
      .subscribe((data) => {
        console.log('data => ', data);
        this.cursos = data;
      });
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
        this.cursosFiltrados = data.filter((curso) => {
          const codA = this.curso.c_codcur;
          const codAeq = this.curso.c_codcur_equ;
          const codB = curso.c_codcur;
          const codBeq = curso.c_codcur_equ;

          const esMismoCurso = this.curso.id === curso.id;

          return (
            !esMismoCurso &&
            (codA === codB ||
              codA === codBeq ||
              (codAeq && (codAeq === codB || codAeq === codBeq)))
          );
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
    this.mostrarModalCrear = false;
    this.cursosFiltrados = [];
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

  clickGuardarModal() {
    console.log('padre_id => ', this.curso.id);
    console.log('hijos_id => ', this.arrayCheckboxCursos);

    this.horarioService
      .createTransversal(this.curso.id, this.arrayCheckboxCursos)
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.getCursos();
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
        },
      });
  }
}
