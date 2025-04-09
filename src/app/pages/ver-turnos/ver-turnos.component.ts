import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Turno } from '../../interfaces/turno';
import { TurnoService } from '../../services/turno.service';
import { Router } from '@angular/router';
import { Especialidad } from '../../interfaces/Curso';
import { CursoService } from '../../services/curso.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../../services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-ver-turnos',
  standalone: false,
  templateUrl: './ver-turnos.component.html',
  styleUrl: './ver-turnos.component.css',
})
export class VerTurnosComponent implements OnInit {
  mostrarModalCrear: boolean = false;
  formularioHorario!: FormGroup;

  itemsPorPagina = 10;
  paginaActual = 1;
  modalAbierto = false;
  turnos: Turno[] = [];
  turnoSeleccionado: { [key: number]: string } = {};

  // Filtros seleccionados
  filtros = {
    c_codfac: '',
    c_codesp: '',
    c_codmod: '',
    n_ciclo: '',
    estado: '',
    c_grpcur: '',
  };

  especialidades: Especialidad[] = [];
  especialidadesCompletas: Especialidad[] = [];
  especialidadesFiltradas: Especialidad[] = [];

  facultades: string[] = [];
  ciclos: number[] = [];
  estados: { value: string; label: string }[] = [];
  secciones: string[] = [];
  modalidades: { value: string; label: string }[] = [];

  constructor(
    private location: Location,
    private turnoServices: TurnoService,
    private router: Router,
    private cursoServices: CursoService,
    private fb: FormBuilder,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.turnoServices.getTurnos().subscribe((data) => {
      this.turnos = data;
      this.turnosFiltrados = data;
      this.extraerValoresUnicos(data);
    });

    this.cursoServices.getEspecialidades().subscribe((data) => {
      this.especialidadesCompletas = data;
      this.especialidades = data;
    });
  }

  inicializarFormulario() {
    this.formularioHorario = this.fb.group({
      c_codfac: ['', Validators.required],
      c_codesp: ['', Validators.required],
      n_codper: ['', Validators.required],
      c_grpcur: ['', Validators.required],
      n_ciclo: ['', Validators.required],
      c_codmod: ['', Validators.required],
      n_codpla: ['', Validators.required],
    });
  }

  deleteTurno(id: number) {
    this.turnoServices.deleteTurno(id).subscribe({
      next: (res: any) => {
        console.log('res => ', res);
        this.turnoServices.getTurnos().subscribe((data) => {
          this.turnos = data;
          this.turnosFiltrados = data;
          this.extraerValoresUnicos(data);
        });
      },
      error: (er: HttpErrorResponse) => {
        console.log(er);
      },
    });
  }

  obtenerNombreEspecialidad(codesp: string): string {
    const esp = this.especialidadesCompletas.find((e) => e.codesp === codesp);
    console.log('obtenerNombreEspecialidad => ', esp?.nomesp || '');

    return esp?.nomesp || '';
  }

  obtenerNombreModalidad(codmod: string): string {
    const modalidad = this.modalidades.find((m) => m.value == codmod);
    return modalidad?.label || '';
  }

  guardarTurno() {
    console.log('guardarHorario');

    if (this.formularioHorario.invalid) {
      this.formularioHorario.markAllAsTouched();
      this.alertService.error('Todos los campos son necesarios');
      return;
    }

    const form = this.formularioHorario.value;

    const turno = {
      ...form,
      n_codper: Number(form.n_codper),
      n_codpla: Number(form.n_codpla),
      n_ciclo: Number(form.n_ciclo),
      estado: 1,
      nom_fac: this.getNombreFacultad(form.c_codfac),
      nomesp: this.obtenerNombreEspecialidad(form.c_codesp),
      c_nommod: this.obtenerNombreModalidad(form.c_codmod),
      c_codmod: Number(form.c_codmod),
    };

    this.turnoServices.createTurno(turno).subscribe({
      next: (res: any) => {
        console.log('res => ', res);
        this.alertService.success('Se creo el Turno exitosamente');
        this.turnoServices.getTurnos().subscribe((data) => {
          this.turnos = data;
          this.turnosFiltrados = data;
          this.extraerValoresUnicos(data);
          this.mostrarModalCrear = false;

          this.formularioHorario.reset({
            c_codfac: '',
            c_codesp: '',
            n_codper: '',
            c_grpcur: '',
            n_ciclo: '',
            c_codmod: '',
            n_codpla: '',
          });
        });
      },
      error: (er: HttpErrorResponse) => {
        console.log('er => ', er);
        this.alertService.error('Este Turno ya existe.');
      },
    });
  }

  onChangeFacultadFormulario() {
    const codfac = this.formularioHorario.get('c_codfac')?.value;

    this.especialidades = this.especialidadesCompletas.filter(
      (esp) => esp.codfac === codfac
    );

    // Si la especialidad actual ya no pertenece a la nueva facultad, resetea
    const especialidadActual = this.formularioHorario.get('c_codesp')?.value;
    const existe = this.especialidades.some(
      (e) => e.codesp === especialidadActual
    );

    if (!existe) {
      this.formularioHorario.get('c_codesp')?.setValue('');
    }
  }

  verCursos(turno: Turno) {
    this.router.navigate(['/asignarhorario'], {
      queryParams: {
        id: turno.id,
      },
    });
  }

  //#region CRUD turnos

  //#region filtro

  getNombreFacultad(codfac: string): string {
    const facultadesMap: Record<string, string> = {
      S: 'CIENCIAS DE LA SALUD',
      E: 'INGENIERÍA Y NEGOCIOS',
    };
    return facultadesMap[codfac] || codfac;
  }

  extraerValoresUnicos(turnos: Turno[]) {
    this.facultades = [...new Set(turnos.map((t) => t.c_codfac))];
    this.secciones = [...new Set(turnos.map((t) => t.c_grpcur))];
    this.ciclos = [...new Set(turnos.map((t) => t.n_ciclo))];

    // Diccionarios para etiquetas
    const modalidadLabels: { [key: string]: string } = {
      '1': 'PRESENCIAL',
      '2': 'SEMIPRESENCIAL',
      '3': 'VIRTUAL',
    };

    const estadoLabels: { [key: string]: string } = {
      '1': 'ASIGNADO',
      '2': 'NO ASIGNADO',
    };

    // Modalidades únicas
    const modalidadesUnicas = [...new Set(turnos.map((t) => t.c_codmod))];
    this.modalidades = modalidadesUnicas.map((mod) => ({
      value: mod,
      label: modalidadLabels[mod] || mod,
    }));

    // Estados únicos
    const estadosUnicos = [...new Set(turnos.map((t) => t.estado.toString()))];
    this.estados = estadosUnicos.map((est) => ({
      value: est,
      label: estadoLabels[est] || est,
    }));
  }

  aplicarFiltros() {
    const queryParams: any = {};

    for (const key of Object.keys(
      this.filtros
    ) as (keyof typeof this.filtros)[]) {
      if (this.filtros[key]) {
        queryParams[key] = this.filtros[key];
      }
    }

    this.turnoServices.getTurnosFiltrados(queryParams).subscribe((data) => {
      this.turnos = data;
      this.turnosFiltrados = data;
      this.paginaActual = 1;
    });
  }

  onFacultadChange(): void {
    this.filtros.c_codesp = ''; // Reiniciamos especialidad
    this.especialidadesFiltradas = this.especialidadesCompletas.filter(
      (e) => e.codfac === this.filtros.c_codfac
    );

    this.aplicarFiltros();
  }

  //#endregion

  //#endregion

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
    return Math.ceil(this.turnosFiltrados.length / this.itemsPorPagina);
  }

  get turnosPaginados(): Turno[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.turnosFiltrados.slice(inicio, fin);
  }

  abrirModal() {
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  cancel() {
    this.location.back();
  }

  turnosFiltrados: Turno[] = [];
  filtroBusqueda: string = '';

  filtrarturnos() {
    const texto = this.filtroBusqueda.toLowerCase();

    this.turnosFiltrados = this.turnos.filter(
      (turno) =>
        turno.nom_fac.toLowerCase().includes(texto) ||
        turno.nomesp.toLowerCase().includes(texto) ||
        turno.c_grpcur.toLowerCase().includes(texto) ||
        turno.n_ciclo.toString().includes(texto) ||
        turno.c_nommod.toLowerCase().includes(texto) ||
        (turno.estado === 1 ? 'asignado' : 'no asignado')
          .toLowerCase()
          .includes(texto)
    );
    this.paginaActual = 1;
  }

  editarTurno(turno_id: number) {
    this.router.navigate([`/cursos/${turno_id}`]);
  }
}
