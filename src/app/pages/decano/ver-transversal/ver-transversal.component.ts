import { Component } from '@angular/core';
import { HR_Curso } from '../../../interfaces/hr/hr_curso';
import { HR_Periodo } from '../../../interfaces/hr/hr_periodo';
import { CursoService } from '../../../services/curso.service';
import { AlertService } from '../../../services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-ver-transversal',
  standalone: false,
  templateUrl: './ver-transversal.component.html',
  styleUrl: './ver-transversal.component.css',
})
export class VerTransversalComponent {
  cursos: HR_Curso[] = [];
  curso!: HR_Curso;

  Math = Math;

  totalCursos!: number;

  periodos: HR_Periodo[] = [
    { n_codper: 20251, f_cierre: new Date() },
    { n_codper: 20252, f_cierre: new Date() },
    { n_codper: 20261, f_cierre: new Date() },
  ];

  paginaActual: number = 1;
  todosSeleccionados: boolean = false;

  especialidades: { nomesp: string; codesp: string; codfac: string }[] = [
    {
      nomesp: 'ADMINISTRACIÓN DE NEGOCIOS INTERNACIONALES',
      codesp: 'E1',
      codfac: 'E',
    },
    { nomesp: 'ADMINISTRACIÓN Y MARKETING', codesp: 'E2', codfac: 'E' },
    { nomesp: 'CONTABILIDAD Y FINANZAS', codesp: 'E3', codfac: 'E' },
    { nomesp: 'INGENIERÍA INDUSTRIAL', codesp: 'E5', codfac: 'E' },
    { nomesp: 'INGENIERÍA DE IA', codesp: 'E6', codfac: 'E' },
    { nomesp: 'INGENIERÍA DE SISTEMAS', codesp: 'E7', codfac: 'E' },
    { nomesp: 'ENFERMERÍA', codesp: 'S1', codfac: 'S' },
    { nomesp: 'FARMACIA Y BIOQUÍMICA', codesp: 'S2', codfac: 'S' },
    { nomesp: 'NUTRICIÓN Y DIETÉTICA', codesp: 'S3', codfac: 'S' },
    { nomesp: 'PSICOLOGÍA', codesp: 'S4', codfac: 'S' },
    { nomesp: 'TM TERAPIA FÍSICA Y REHAB', codesp: 'S5', codfac: 'S' },
    { nomesp: 'TM LAB. CLÍNICO Y ANAT. PAT', codesp: 'S6', codfac: 'S' },
    { nomesp: 'MEDICINA', codesp: 'S7', codfac: 'S' },
  ];

  especialidadesModal: { nomesp: string; codesp: string; codfac: string }[] = [
    {
      nomesp: 'ADMINISTRACIÓN DE NEGOCIOS INTERNACIONALES',
      codesp: 'E1',
      codfac: 'E',
    },
    { nomesp: 'ADMINISTRACIÓN Y MARKETING', codesp: 'E2', codfac: 'E' },
    { nomesp: 'CONTABILIDAD Y FINANZAS', codesp: 'E3', codfac: 'E' },
    { nomesp: 'INGENIERÍA INDUSTRIAL', codesp: 'E5', codfac: 'E' },
    { nomesp: 'INGENIERÍA DE IA', codesp: 'E6', codfac: 'E' },
    { nomesp: 'INGENIERÍA DE SISTEMAS', codesp: 'E7', codfac: 'E' },
    { nomesp: 'ENFERMERÍA', codesp: 'S1', codfac: 'S' },
    { nomesp: 'FARMACIA Y BIOQUÍMICA', codesp: 'S2', codfac: 'S' },
    { nomesp: 'NUTRICIÓN Y DIETÉTICA', codesp: 'S3', codfac: 'S' },
    { nomesp: 'PSICOLOGÍA', codesp: 'S4', codfac: 'S' },
    { nomesp: 'TM TERAPIA FÍSICA Y REHAB', codesp: 'S5', codfac: 'S' },
    { nomesp: 'TM LAB. CLÍNICO Y ANAT. PAT', codesp: 'S6', codfac: 'S' },
    { nomesp: 'MEDICINA', codesp: 'S7', codfac: 'S' },
  ];

  cursosFiltrados: HR_Curso[] = [];

  selectFacultadad: string = '';
  selectEspecialidad: string = '';
  selectModalidad: string = '';
  selectPlan: string = '2025';
  selectPeriodo: number = 20261;
  selectCiclo: string = '';

  arrayCheckboxCursos: number[] = [];

  mostrarModalCrear: boolean = false;

  itemsPorPagina: number = 20;

  cargandoCursos: boolean = true;

  busquedaEjecutada: boolean = false;

  filtros = {
    c_codmod: '',
    n_codper: '2025',
    periodo: 20261,
    c_codfac: '',
    c_codesp: '',
    n_ciclo: 0,
    busqueda: '',
  };

  filtroBusqueda: string = '';

  constructor(
    private cursoService: CursoService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {}

  getCursos() {
    const skip = (this.paginaActual - 1) * this.itemsPorPagina;
    const take = this.itemsPorPagina;

    this.cursoService
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
        this.totalCursos = data.total;
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

  getCursosAgrupados() {
    this.cargandoCursos = true;
    this.alertService.iniciarSolicitud();

    this.cursoService
      .getCurso(
        Number(this.filtros.c_codmod),
        this.filtros.n_codper,
        this.filtros.periodo,
        this.filtros.c_codfac,
        this.filtros.c_codesp,
        undefined,
        this.filtros.n_ciclo,
        undefined,
        this.filtros.busqueda.trim()
      )
      .subscribe({
        next: (data) => {
          this.cursosFiltrados = data.data.filter((curso) => {
            return (
              curso.turno_id !== this.curso.turno_id &&
              curso.grupos_hijo?.length === 0
            );
          });
        },
        error: (error) => {
          console.error('Error al obtener cursos transversales', error);
          this.alertService.error(
            'No se pudieron obtener los cursos transversales'
          );
        },
        complete: () => {
          this.cargandoCursos = false;
          this.alertService.finalizarSolicitud();
          if (this.cursosFiltrados.length === 0) {
            this.alertService.warning('No hay cursos');
          }
        },
      });
  }

  changeSelectFacultad() {
    this.especialidades = this.especialidades.filter(
      (especialidad) => especialidad.codfac === this.selectFacultadad
    );
    this.selectEspecialidad = '';
  }

  changeSelectFacultadModal() {
    this.especialidadesModal = this.especialidadesModal.filter(
      (especialidad) => especialidad.codfac === this.filtros.c_codfac
    );

    this.filtros.c_codesp = '';
  }

  clickDefinirCursoTransversales() {
    this.getCursos();
  }

  clickMas(curso: HR_Curso) {
    this.curso = curso;
    this.mostrarModalCrear = true;
  }

  clickBuscarCursosModal() {
    this.busquedaEjecutada = true;
    this.getCursosAgrupados();
  }

  cerrarModal() {
    this.todosSeleccionados = false;
    this.mostrarModalCrear = false;
    this.cursosFiltrados = [];
    this.arrayCheckboxCursos = [];
    this.filtros = {
      c_codmod: '',
      n_codper: '2025',
      periodo: 20261,
      c_codfac: '',
      c_codesp: '',
      n_ciclo: 0,
      busqueda: '',
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
      this.arrayCheckboxCursos = this.cursosFiltrados.map((c) => c.id);
    } else {
      this.arrayCheckboxCursos = [];
    }
  }

  clickGuardarModal() {
    this.cursoService
      .createTransversal(this.curso.id, this.arrayCheckboxCursos, 0)
      .subscribe({
        next: (res: any) => {
          this.getCursos();
          this.cursosFiltrados = [];
          this.arrayCheckboxCursos = [];
          this.filtros = {
            c_codmod: '',
            n_codper: '2025',
            periodo: 20261,
            c_codfac: '',
            c_codesp: '',
            n_ciclo: 0,
            busqueda: '',
          };
          this.mostrarModalCrear = false;
          this.alertService.success('Exito', 'Se creo grupo correctamente');
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
          this.alertService.error(`${err.error.errores}`);
        },
      });
  }

  async confirmarEliminacionTransversal(padre_id: number) {
    const confirmado = this.alertService.confirm(
      '¿Estás seguro de eliminar este grupo?\n\n⚠️ Esto eliminará todos los horarios asignados actualmente.'
    );

    if (await confirmado) {
      this.clickDeleteTransversal(padre_id);
    }
  }

  clickDeleteTransversal(padre_id: number) {
    this.cursoService.deleteTransversal(padre_id).subscribe({
      next: (res: any) => {
        this.getCursos();
        this.alertService.success('Exito', 'Se borro este grupo correctamente');
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
